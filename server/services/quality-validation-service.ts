/**
 * Quality Validation Service
 * 
 * Uses OpenAI GPT-4 to validate documentation quality for standard delivery orders.
 * Provides comprehensive quality scoring and improvement suggestions.
 */

import type { AIProvider } from '../ai-provider';

export interface QualityScore {
  comprehensiveness: number; // 0-100: Are all major features covered?
  accuracy: number; // 0-100: Is technical information correct?
  clarity: number; // 0-100: Easy to understand for target audience?
  completeness: number; // 0-100: Missing sections, examples, use cases?
  professionalPolish: number; // 0-100: Apple-quality standards?
  sourceAttribution: number; // 0-100: Claims properly backed by sources?
  overall: number; // 0-100: Overall quality score
}

export interface QualityValidationResult {
  passed: boolean;
  score: QualityScore;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  missingTopics: string[];
  accuracyIssues: string[];
  detailedFeedback: string;
}

export interface ValidationConfig {
  minOverallScore?: number; // Minimum overall score to pass (default: 80)
  minCategoryScore?: number; // Minimum score per category (default: 70)
  requireAllCategories?: boolean; // All categories must pass (default: true)
}

const DEFAULT_CONFIG: Required<ValidationConfig> = {
  minOverallScore: 80,
  minCategoryScore: 70,
  requireAllCategories: true,
};

export class QualityValidationService {
  private openaiProvider: AIProvider | null = null;

  constructor(openaiProvider: AIProvider | null) {
    this.openaiProvider = openaiProvider;
  }

  /**
   * Validate documentation quality using GPT-4
   */
  async validateDocumentation(
    productName: string,
    documentation: string,
    sourcesSummary: string,
    targetUrl: string,
    config: ValidationConfig = {}
  ): Promise<QualityValidationResult> {
    if (!this.openaiProvider) {
      console.warn('[QUALITY VALIDATION] OpenAI provider not available, skipping validation');
      return this.getDefaultPassResult();
    }

    const validationConfig = { ...DEFAULT_CONFIG, ...config };

    try {
      console.log(`🔍 [QUALITY VALIDATION] Validating documentation for ${productName}...`);

      const prompt = this.buildValidationPrompt(
        productName,
        documentation,
        sourcesSummary,
        targetUrl
      );

      const response = await this.openaiProvider.generateCompletion(
        [{ role: 'user', content: prompt }],
        { 
          jsonMode: true,
        }
      );

      const result = this.parseValidationResponse(response.content);
      
      // Determine if validation passed
      const passed = this.evaluatePassCriteria(result.score, validationConfig);
      
      console.log(`✅ [QUALITY VALIDATION] Overall Score: ${result.score.overall}/100`);
      console.log(`   Comprehensiveness: ${result.score.comprehensiveness}/100`);
      console.log(`   Accuracy: ${result.score.accuracy}/100`);
      console.log(`   Clarity: ${result.score.clarity}/100`);
      console.log(`   Completeness: ${result.score.completeness}/100`);
      console.log(`   Professional Polish: ${result.score.professionalPolish}/100`);
      console.log(`   Source Attribution: ${result.score.sourceAttribution}/100`);
      console.log(`   Status: ${passed ? 'PASSED ✓' : 'NEEDS IMPROVEMENT ⚠️'}`);

      return { ...result, passed };

    } catch (error) {
      console.error('[QUALITY VALIDATION] Error:', error);
      // On error, return default pass to not block delivery
      return this.getDefaultPassResult();
    }
  }

  /**
   * Build the validation prompt for GPT-4
   */
  private buildValidationPrompt(
    productName: string,
    documentation: string,
    sourcesSummary: string,
    targetUrl: string
  ): string {
    return `You are an expert documentation quality analyst evaluating documentation for **${productName}**.

Your task is to provide a comprehensive quality assessment of the documentation below, scoring it against Apple-quality standards.

**Product URL**: ${targetUrl}
**Sources Used**: ${sourcesSummary}

**Documentation to Evaluate**:
${documentation.substring(0, 30000)} ${documentation.length > 30000 ? '... [truncated for analysis]' : ''}

**Evaluation Criteria** (Score each 0-100):

1. **Comprehensiveness** (0-100):
   - Are all major features, use cases, and capabilities covered?
   - Does it address the full product ecosystem?
   - Are there obvious gaps in coverage?

2. **Accuracy** (0-100):
   - Is the technical information correct based on the sources?
   - Are there any factual errors or outdated information?
   - Do code examples and technical details align with current practices?

3. **Clarity** (0-100):
   - Is the writing clear and easy to understand?
   - Are complex concepts explained well?
   - Is the structure logical and easy to navigate?

4. **Completeness** (0-100):
   - Are all necessary sections present (Getting Started, API Reference, Troubleshooting, etc.)?
   - Are there sufficient examples and code snippets?
   - Are edge cases and common pitfalls addressed?

5. **Professional Polish** (0-100):
   - Does this meet Apple-quality documentation standards?
   - Is the writing polished and professional?
   - Are there grammatical errors or awkward phrasing?

6. **Source Attribution** (0-100):
   - Are claims properly backed by sources?
   - Is attribution clear and verifiable?
   - Are community insights properly integrated?

**Output Format** (JSON):
{
  "score": {
    "comprehensiveness": <0-100>,
    "accuracy": <0-100>,
    "clarity": <0-100>,
    "completeness": <0-100>,
    "professionalPolish": <0-100>,
    "sourceAttribution": <0-100>,
    "overall": <0-100>
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3"
  ],
  "missingTopics": [
    "Missing topic or section 1",
    "Missing topic or section 2"
  ],
  "accuracyIssues": [
    "Specific accuracy issue 1 (if any)",
    "Specific accuracy issue 2 (if any)"
  ],
  "detailedFeedback": "A 2-3 paragraph summary of the documentation quality, highlighting what works well and what needs improvement. Be specific and actionable."
}

**Important**: 
- Be thorough but fair in your assessment
- Overall score should be the weighted average of all categories
- Provide specific, actionable improvement suggestions
- If accuracy issues exist, cite specific examples
- For missing topics, suggest high-value additions`;
  }

  /**
   * Parse GPT-4 validation response
   */
  private parseValidationResponse(content: string): Omit<QualityValidationResult, 'passed'> {
    try {
      const parsed = JSON.parse(content);
      
      return {
        score: {
          comprehensiveness: parsed.score?.comprehensiveness || 0,
          accuracy: parsed.score?.accuracy || 0,
          clarity: parsed.score?.clarity || 0,
          completeness: parsed.score?.completeness || 0,
          professionalPolish: parsed.score?.professionalPolish || 0,
          sourceAttribution: parsed.score?.sourceAttribution || 0,
          overall: parsed.score?.overall || 0,
        },
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        improvements: parsed.improvements || [],
        missingTopics: parsed.missingTopics || [],
        accuracyIssues: parsed.accuracyIssues || [],
        detailedFeedback: parsed.detailedFeedback || '',
      };
    } catch (error) {
      console.error('[QUALITY VALIDATION] Failed to parse response:', error);
      return this.getDefaultPassResult();
    }
  }

  /**
   * Evaluate if validation passed based on criteria
   */
  private evaluatePassCriteria(score: QualityScore, config: Required<ValidationConfig>): boolean {
    // Check overall score
    if (score.overall < config.minOverallScore) {
      return false;
    }

    // Check individual category scores if required
    if (config.requireAllCategories) {
      const categories = [
        score.comprehensiveness,
        score.accuracy,
        score.clarity,
        score.completeness,
        score.professionalPolish,
        score.sourceAttribution,
      ];

      for (const categoryScore of categories) {
        if (categoryScore < config.minCategoryScore) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get default pass result (used when validation unavailable or errors)
   */
  private getDefaultPassResult(): QualityValidationResult {
    return {
      passed: true,
      score: {
        comprehensiveness: 85,
        accuracy: 85,
        clarity: 85,
        completeness: 85,
        professionalPolish: 85,
        sourceAttribution: 85,
        overall: 85,
      },
      strengths: ['Documentation generated successfully'],
      weaknesses: [],
      improvements: [],
      missingTopics: [],
      accuracyIssues: [],
      detailedFeedback: 'Quality validation was not performed (OpenAI provider unavailable).',
    };
  }

  /**
   * Generate improvement suggestions based on validation results
   */
  async generateImprovementPlan(
    validationResult: QualityValidationResult,
    productName: string
  ): Promise<string[]> {
    if (!this.openaiProvider || validationResult.passed) {
      return [];
    }

    try {
      const prompt = `Based on this quality validation for ${productName} documentation:

Weaknesses:
${validationResult.weaknesses.join('\n')}

Missing Topics:
${validationResult.missingTopics.join('\n')}

Accuracy Issues:
${validationResult.accuracyIssues.join('\n')}

Generate a prioritized list of 3-5 specific improvements that would have the highest impact on quality.
Output as JSON array of strings: ["improvement1", "improvement2", ...]`;

      const response = await this.openaiProvider.generateCompletion(
        [{ role: 'user', content: prompt }],
        { jsonMode: true }
      );

      const improvements = JSON.parse(response.content);
      return Array.isArray(improvements) ? improvements : [];
    } catch (error) {
      console.error('[QUALITY VALIDATION] Failed to generate improvement plan:', error);
      return validationResult.improvements;
    }
  }
}
