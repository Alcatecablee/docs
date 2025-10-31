/**
 * Critic Agent
 * Validates and refines documentation quality
 * Ensures comprehensive coverage, accuracy, and clarity
 */

import { BaseAgent } from './base-agent';
import { AgentContext, CriticResult, QualityIssue, CombinedAgentResults } from './types';

export class CriticAgent extends BaseAgent<CriticResult> {
  readonly name = 'Critic Agent';
  protected readonly config = {
    timeout: 30000, // 30 seconds
    retries: 2,
    cacheTTL: 0, // No caching for critic (always fresh validation)
    enabled: true
  };

  /**
   * Validate the combined agent results and suggest improvements
   */
  async execute(context: AgentContext, agentResults?: CombinedAgentResults): Promise<CriticResult> {
    const startTime = Date.now();
    
    try {
      this.log('Validating documentation quality for ' + context.product);
      
      if (!agentResults) {
        throw new Error('Cannot validate without agent results');
      }
      
      // Analyze the combined results from all agents
      const prompt = this.buildCriticPrompt(context, agentResults);
      
      const response = await this.measure('LLM quality analysis', () =>
        this.callLLM(prompt, {
          temperature: 0.4, // Lower temperature for objective analysis
          maxTokens: 4000,
          jsonMode: true
        })
      );
      
      // Parse the critic results
      const data = this.parseJSON<any>(response);
      
      if (!data) {
        throw new Error('Failed to parse critic results');
      }
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore(data, agentResults);
      
      const executionTime = Date.now() - startTime;
      this.log(`Quality validation completed with score ${qualityScore}/100 in ${executionTime}ms`);
      
      return {
        agentName: this.name,
        executionTime,
        success: true,
        data: {
          qualityScore,
          issues: data.issues || [],
          suggestions: data.suggestions || [],
          missingContent: data.missingContent || [],
          strengths: data.strengths || [],
          needsRefinement: qualityScore < 75
        }
      };
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      this.log(`Quality validation failed: ${error.message}`, 'error');
      
      // Return default result (assume quality is acceptable)
      return {
        agentName: this.name,
        executionTime,
        success: false,
        error: error.message,
        data: {
          qualityScore: 70,
          issues: [],
          suggestions: [],
          missingContent: [],
          strengths: [],
          needsRefinement: false
        }
      };
    }
  }

  /**
   * Build the critic prompt to analyze documentation quality
   */
  private buildCriticPrompt(context: AgentContext, results: CombinedAgentResults): string {
    const researchData = results.research.data;
    const codeData = results.code.data;
    const structureData = results.structure.data;
    
    const researchSummary = `
- ${researchData.issues.length} issues found
- ${researchData.solutions.length} solutions identified
- ${researchData.useCases.length} use cases documented
- Sentiment: ${researchData.communityInsights.sentiment}
- Trend: ${researchData.communityInsights.popularityTrend}
`;

    const codeSummary = `
- ${codeData.quickStart.length} quick start examples
- ${codeData.apiExamples.length} API examples
- ${codeData.integrationExamples.length} integration examples
- ${codeData.commonPatterns.length} common patterns
`;

    const structureSummary = `
- ${structureData.outline.length} sections planned
- ${structureData.pageCount} pages total
- ${structureData.contentGaps.length} content gaps identified
`;

    return `You are a documentation quality critic analyzing ${context.product} documentation.

**Research Data**:
${researchSummary}

**Code Examples**:
${codeSummary}

**Structure**:
${structureSummary}

**Your Task**: Analyze the quality and completeness of the documentation plan.

Evaluate:
1. **Completeness**: Is all essential information covered?
2. **Accuracy**: Are the code examples and solutions reliable?
3. **Clarity**: Is the structure logical and easy to navigate?
4. **Depth**: Is there sufficient detail for developers?
5. **Balance**: Is there a good mix of theory and practice?

Output JSON format:
\`\`\`json
{
  "issues": [
    {
      "severity": "high|medium|low",
      "category": "completeness|accuracy|clarity|depth",
      "description": "What's wrong",
      "affectedSection": "Which section/agent"
    }
  ],
  "suggestions": [
    "Concrete improvement suggestion 1",
    "Concrete improvement suggestion 2"
  ],
  "missingContent": [
    "Specific missing topic 1",
    "Specific missing topic 2"
  ],
  "strengths": [
    "What's good about the documentation plan"
  ]
}
\`\`\`

Be objective, specific, and actionable.`;
  }

  /**
   * Calculate overall quality score based on various factors
   */
  private calculateQualityScore(critique: any, results: CombinedAgentResults): number {
    let score = 100;
    
    // Deduct points for issues
    const issues = critique.issues || [];
    const highIssues = issues.filter((i: any) => i.severity === 'high').length;
    const mediumIssues = issues.filter((i: any) => i.severity === 'medium').length;
    const lowIssues = issues.filter((i: any) => i.severity === 'low').length;
    
    score -= highIssues * 15;
    score -= mediumIssues * 8;
    score -= lowIssues * 3;
    
    // Deduct for missing content
    const missingContent = critique.missingContent || [];
    score -= missingContent.length * 5;
    
    // Bonus for comprehensive research
    if (results.research.data.issues.length >= 10) score += 5;
    if (results.research.data.solutions.length >= 10) score += 5;
    if (results.research.data.useCases.length >= 8) score += 5;
    
    // Bonus for good code examples
    if (results.code.data.quickStart.length >= 3) score += 5;
    if (results.code.data.apiExamples.length >= 5) score += 5;
    
    // Bonus for good structure
    if (results.structure.data.outline.length >= 5) score += 5;
    if (results.structure.data.contentGaps.length === 0) score += 5;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
}
