/**
 * Research Agent
 * Gathers external knowledge from Stack Overflow, GitHub, Reddit, YouTube
 * Uses REAL API integrations instead of LLM prompts
 */

import { BaseAgent } from './base-agent';
import { AgentContext, ResearchResult, ResearchIssue, ResearchSolution, ResearchUseCase } from './types';
import { searchService } from '../search-service';
import { youtubeService } from '../youtube-service';
import { redditService } from '../reddit-service';
import { stackExchangeService } from '../stackexchange-service';

export class ResearchAgent extends BaseAgent<ResearchResult> {
  readonly name = 'Research Agent';
  protected readonly config = {
    timeout: 60000, // 60 seconds (increased for real API calls)
    retries: 2,
    cacheTTL: 3600, // 1 hour
    enabled: true
  };

  async execute(context: AgentContext): Promise<ResearchResult> {
    const startTime = Date.now();
    
    try {
      this.log('Starting real API research for ' + context.product);
      
      // Use REAL search service to gather comprehensive research
      const research = await this.measure('API research calls', () =>
        searchService.performComprehensiveResearch(
          context.product,
          context.url,
          'medium', // Will be auto-estimated
          0, // crawledPageCount (will be estimated by service)
          true, // youtubeApiAccess
          false // youtubeTranscripts
        )
      );
      
      // Transform the research data to match our agent format
      const issues: ResearchIssue[] = [
        ...research.stackOverflowAnswers.slice(0, 10).map(so => ({
          title: so.question,
          url: so.url,
          votes: so.votes,
          solution: so.answer.substring(0, 500),
          source: 'stackoverflow' as const
        })),
        ...research.gitHubIssues.slice(0, 10).map(gh => ({
          title: gh.title,
          url: gh.url,
          votes: gh.comments_count,
          solution: gh.description.substring(0, 500),
          source: 'github' as const
        }))
      ];
      
      const solutions: ResearchSolution[] = research.stackOverflowAnswers
        .filter(so => so.accepted)
        .slice(0, 15)
        .map(so => ({
          approach: so.question,
          code: so.answer.substring(0, 1000),
          popularity: so.votes,
          source: so.url
        }));
      
      const useCases: ResearchUseCase[] = [
        ...research.youtubeVideos.slice(0, 8).map(yt => ({
          scenario: yt.title,
          description: yt.description.substring(0, 300),
          source: 'YouTube',
          url: yt.url
        })),
        ...research.redditPosts.slice(0, 8).map(rd => ({
          scenario: rd.title,
          description: rd.snippet.substring(0, 300),
          source: 'Reddit',
          url: rd.url
        }))
      ];
      
      // Analyze community sentiment from Reddit and Stack Overflow
      const avgRedditUpvotes = research.redditPosts.length > 0
        ? research.redditPosts.reduce((sum, p) => sum + p.upvotes, 0) / research.redditPosts.length
        : 0;
      
      const avgSOVotes = research.stackOverflowAnswers.length > 0
        ? research.stackOverflowAnswers.reduce((sum, a) => sum + a.votes, 0) / research.stackOverflowAnswers.length
        : 0;
      
      const sentiment = (avgRedditUpvotes + avgSOVotes) > 20 ? 'positive' 
                      : (avgRedditUpvotes + avgSOVotes) > 5 ? 'neutral'
                      : 'negative';
      
      const popularityTrend = research.youtubeVideos.length > 5 ? 'rising'
                            : research.youtubeVideos.length > 2 ? 'stable'
                            : 'declining';
      
      // Extract common pain points from issues
      const commonPainPoints: string[] = research.gitHubIssues
        .filter(issue => issue.state === 'open')
        .slice(0, 5)
        .map(issue => issue.title);
      
      const sources = [
        `Stack Overflow: ${research.stackOverflowAnswers.length} answers`,
        `GitHub: ${research.gitHubIssues.length} issues`,
        `YouTube: ${research.youtubeVideos.length} videos`,
        `Reddit: ${research.redditPosts.length} discussions`,
        `DEV.to: ${research.devToArticles.length} articles`,
        `Total: ${research.totalSources} sources`
      ];
      
      const executionTime = Date.now() - startTime;
      this.log(`Research completed with ${research.totalSources} sources in ${executionTime}ms`);
      
      return {
        agentName: this.name,
        executionTime,
        success: true,
        data: {
          issues,
          solutions,
          useCases,
          communityInsights: {
            sentiment: sentiment as 'positive' | 'neutral' | 'negative',
            popularityTrend: popularityTrend as 'rising' | 'stable' | 'declining',
            commonPainPoints
          },
          sources
        }
      };
      
    } catch (error: any) {
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

  // Removed buildResearchPrompt - now using real API services
  private oldBuildResearchPrompt(context: AgentContext): string {
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
