/**
 * Research Agent
 * Gathers external knowledge from Stack Overflow, GitHub, Reddit, YouTube
 */

import { BaseAgent } from './base-agent';
import { AgentContext, ResearchResult, researchResultSchema } from './types';

export class ResearchAgent extends BaseAgent<ResearchResult> {
  readonly name = 'Research Agent';
  protected readonly config = {
    timeout: 30000, // 30 seconds
    retries: 2,
    cacheTTL: 3600, // 1 hour
    enabled: true
  };

  async execute(context: AgentContext): Promise<ResearchResult> {
    const startTime = Date.now();
    
    try {
      this.log('Starting research for ' + context.product);
      
      // Generate research prompt
      const prompt = this.buildResearchPrompt(context);
      
      // Call LLM to gather and analyze external knowledge
      const response = await this.measure('LLM research call', () =>
        this.callLLM(prompt, {
          temperature: 0.4, // Lower temperature for factual research
          maxTokens: 6000
        })
      );
      
      // Parse the research results
      const data = this.parseJSON<any>(response);
      
      if (!data) {
        throw new Error('Failed to parse research results');
      }
      
      // Validate the output
      const validation = await this.validateOutput(data, researchResultSchema);
      
      if (!validation.valid) {
        this.log(`Validation warning: ${validation.error}`, 'warn');
        // Continue with partial data
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        agentName: this.name,
        executionTime,
        success: true,
        data: validation.data || data
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.log(`Research failed: ${error.message}`, 'error');
      
      // Return empty but valid result on failure (graceful degradation)
      return {
        agentName: this.name,
        executionTime,
        success: false,
        error: error.message,
        data: {
          issues: [],
          solutions: [],
          useCases: [],
          communityInsights: {
            sentiment: 'neutral' as const,
            popularityTrend: 'stable' as const,
            commonPainPoints: []
          },
          sources: []
        }
      };
    }
  }

  private buildResearchPrompt(context: AgentContext): string {
    return `You are a research specialist analyzing external knowledge about ${context.product}.

**Your Task**: Research and analyze community knowledge from multiple sources.

**Product Information**:
- Name: ${context.product}
- URL: ${context.url}
${context.repoUrl ? `- GitHub: ${context.repoUrl}` : ''}

**Research Areas**:

1. **Common Issues & Problems**
   - Search for: "${context.product} issues", "${context.product} not working", "${context.product} error"
   - Focus on: Stack Overflow, GitHub issues, Reddit discussions
   - Extract: Most common problems, error messages, configuration issues
   
2. **Solutions & Workarounds**
   - Search for: "${context.product} how to", "${context.product} tutorial"
   - Focus on: Accepted answers, upvoted solutions, official responses
   - Extract: Working solutions, code examples, best practices
   
3. **Real-World Use Cases**
   - Search for: "${context.product} use case", "using ${context.product} for"
   - Focus on: Blog posts, case studies, YouTube tutorials
   - Extract: Practical applications, integration patterns, success stories
   
4. **Community Sentiment**
   - Analyze: Overall sentiment (positive/neutral/negative)
   - Identify: Common praise points and pain points
   - Assess: Popularity trend (rising/stable/declining)

**Output Format** (JSON):
\`\`\`json
{
  "issues": [
    {
      "title": "Brief description of the issue",
      "url": "https://stackoverflow.com/...",
      "votes": 42,
      "solution": "Summary of accepted solution (if available)",
      "source": "stackoverflow"
    }
  ],
  "solutions": [
    {
      "approach": "Description of the solution approach",
      "code": "Code snippet (if applicable)",
      "popularity": 85,
      "source": "Stack Overflow answer by user123"
    }
  ],
  "useCases": [
    {
      "scenario": "Building real-time chat applications",
      "description": "How this product is used in this scenario",
      "source": "Medium article",
      "url": "https://..."
    }
  ],
  "communityInsights": {
    "sentiment": "positive",
    "popularityTrend": "rising",
    "commonPainPoints": [
      "Setup complexity",
      "Documentation gaps"
    ]
  },
  "sources": [
    "Stack Overflow: 47 questions analyzed",
    "GitHub: 23 issues reviewed",
    "Reddit: 12 discussions",
    "YouTube: 5 tutorials"
  ]
}
\`\`\`

**Important Guidelines**:
- Focus on REAL, verifiable information from actual sources
- Include URLs when possible
- Prioritize recent (last 12 months) information
- Extract actionable insights, not generic statements
- Identify patterns across multiple sources
- Be objective and balanced in sentiment analysis

Provide comprehensive research results in the JSON format above.`;
  }
}
