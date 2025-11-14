/**
 * Competitive Intelligence Insight Extractor
 * Analyzes multi-source research data and extracts competitive intelligence insights
 */

import { createAIProvider } from './ai-provider';
import {
  ciPrompts,
  PricingInsights,
  ComplaintInsights,
  MigrationInsights,
  StrengthsWeaknessesInsights,
  FeatureInsights
} from './agents/ci-prompts';
import type { SearchResult } from './search-service';
import type { RedditPost } from './reddit-service';
import type { YouTubeVideo } from './youtube-service';
import type { StackOverflowAnswer, GitHubIssue } from './search-service';
import type { BattlecardData } from './battlecard-generator';

export interface CIResearchData {
  stackOverflowAnswers: StackOverflowAnswer[];
  gitHubIssues: GitHubIssue[];
  youtubeVideos: YouTubeVideo[];
  redditPosts: RedditPost[];
  devToArticles: any[];
  forumPosts: any[];
}

export class CIInsightExtractor {
  /**
   * Extract comprehensive competitive intelligence from research data
   */
  async extractInsights(
    competitorName: string,
    researchData: CIResearchData
  ): Promise<BattlecardData> {
    console.log(`📊 Extracting CI insights for ${competitorName}...`);

    // Prepare aggregated content for analysis
    const aggregatedContent = this.aggregateContent(researchData);

    // Extract insights in parallel using AI
    const [pricing, complaints, migration, strengthsWeaknesses, features] = await Promise.all([
      this.extractPricingInsights(aggregatedContent),
      this.extractComplaintInsights(aggregatedContent),
      this.extractMigrationInsights(aggregatedContent),
      this.extractStrengthsWeaknesses(aggregatedContent),
      this.extractFeatureInsights(aggregatedContent)
    ]);

    // Analyze sentiment from community data
    const sentiment = this.analyzeSentiment(researchData);

    // Build battlecard data structure
    const battlecardData: BattlecardData = {
      competitorName,
      generatedAt: new Date().toISOString(),
      overview: {
        description: features.technicalStack || `${competitorName} is a platform mentioned across ${this.getTotalSources(researchData)} community sources.`,
        marketPosition: this.determineMarketPosition(researchData, sentiment),
        targetCustomers: this.inferTargetCustomers(features.popularUseCases)
      },
      pricing: {
        model: pricing.model || 'Unknown',
        tiers: pricing.tiers || [],
        complaints: pricing.complaints || []
      },
      strengths: strengthsWeaknesses.strengths || [],
      weaknesses: strengthsWeaknesses.weaknesses || [],
      customerSentiment: {
        overall: sentiment.overall,
        commonPraise: strengthsWeaknesses.differentiators || [],
        commonComplaints: complaints.commonComplaints || [],
        migrationSignals: migration.migrationSignals || []
      },
      technicalInsights: {
        githubIssues: researchData.gitHubIssues.slice(0, 10).map(issue => ({
          title: issue.title,
          url: issue.url,
          votes: issue.comments_count || 0
        })),
        stackOverflowTopics: researchData.stackOverflowAnswers.slice(0, 10).map(answer => ({
          question: answer.question,
          url: answer.url,
          votes: answer.votes
        })),
        popularUses: features.popularUseCases || []
      },
      sources: {
        reddit: researchData.redditPosts.length,
        stackOverflow: researchData.stackOverflowAnswers.length,
        github: researchData.gitHubIssues.length,
        youtube: researchData.youtubeVideos.length,
        devTo: researchData.devToArticles.length,
        forums: researchData.forumPosts.length
      }
    };

    console.log(`✅ CI insights extracted successfully`);
    return battlecardData;
  }

  private aggregateContent(data: CIResearchData): string {
    const sections: string[] = [];

    // Reddit discussions
    if (data.redditPosts.length > 0) {
      sections.push('=== REDDIT DISCUSSIONS ===');
      data.redditPosts.slice(0, 20).forEach(post => {
        sections.push(`Title: ${post.title}`);
        sections.push(`Content: ${post.content.substring(0, 500)}`);
        sections.push(`Upvotes: ${post.upvotes}, Comments: ${post.comments}`);
        sections.push('---');
      });
    }

    // Stack Overflow
    if (data.stackOverflowAnswers.length > 0) {
      sections.push('=== STACK OVERFLOW Q&A ===');
      data.stackOverflowAnswers.slice(0, 20).forEach(answer => {
        sections.push(`Question: ${answer.question}`);
        sections.push(`Answer: ${answer.answer.substring(0, 500)}`);
        sections.push(`Votes: ${answer.votes}, Accepted: ${answer.accepted}`);
        sections.push('---');
      });
    }

    // GitHub Issues
    if (data.gitHubIssues.length > 0) {
      sections.push('=== GITHUB ISSUES ===');
      data.gitHubIssues.slice(0, 20).forEach(issue => {
        sections.push(`Title: ${issue.title}`);
        sections.push(`Description: ${issue.description.substring(0, 500)}`);
        sections.push(`State: ${issue.state}, Comments: ${issue.comments_count}`);
        sections.push('---');
      });
    }

    // YouTube Videos
    if (data.youtubeVideos.length > 0) {
      sections.push('=== YOUTUBE VIDEOS ===');
      data.youtubeVideos.slice(0, 15).forEach(video => {
        sections.push(`Title: ${video.title}`);
        sections.push(`Description: ${video.description.substring(0, 300)}`);
        sections.push(`Views: ${video.views || 0}`);
        sections.push('---');
      });
    }

    return sections.join('\n').substring(0, 30000); // Limit to ~30k chars for AI processing
  }

  private async extractPricingInsights(content: string): Promise<PricingInsights> {
    try {
      const aiProvider = createAIProvider(['openai', 'google', 'groq']);
      const response = await aiProvider.generateCompletion([
        { role: 'system', content: ciPrompts.pricingExtraction },
        { role: 'user', content }
      ], { jsonMode: true });

      return this.parseJSON(response.content, {
        model: 'Unknown',
        tiers: [],
        complaints: [],
        sentiment: 'neutral' as const
      });
    } catch (error) {
      console.error('Pricing extraction error:', error);
      return { model: 'Unknown', tiers: [], complaints: [], sentiment: 'neutral' };
    }
  }

  private async extractComplaintInsights(content: string): Promise<ComplaintInsights> {
    try {
      const aiProvider = createAIProvider(['openai', 'google', 'groq']);
      const response = await aiProvider.generateCompletion([
        { role: 'system', content: ciPrompts.complaintsExtraction },
        { role: 'user', content }
      ], { jsonMode: true });

      return this.parseJSON(response.content, {
        commonComplaints: [],
        technicalIssues: [],
        missingFeatures: [],
        severity: 'medium' as const
      });
    } catch (error) {
      console.error('Complaints extraction error:', error);
      return { commonComplaints: [], technicalIssues: [], missingFeatures: [], severity: 'medium' };
    }
  }

  private async extractMigrationInsights(content: string): Promise<MigrationInsights> {
    try {
      const aiProvider = createAIProvider(['openai', 'google', 'groq']);
      const response = await aiProvider.generateCompletion([
        { role: 'system', content: ciPrompts.migrationSignals },
        { role: 'user', content }
      ], { jsonMode: true });

      return this.parseJSON(response.content, {
        migrationSignals: [],
        alternatives: [],
        migrationReasons: [],
        migrationDifficulty: 'moderate' as const
      });
    } catch (error) {
      console.error('Migration extraction error:', error);
      return { migrationSignals: [], alternatives: [], migrationReasons: [], migrationDifficulty: 'moderate' };
    }
  }

  private async extractStrengthsWeaknesses(content: string): Promise<StrengthsWeaknessesInsights> {
    try {
      const aiProvider = createAIProvider(['openai', 'google', 'groq']);
      const response = await aiProvider.generateCompletion([
        { role: 'system', content: ciPrompts.strengthsWeaknesses },
        { role: 'user', content }
      ], { jsonMode: true });

      return this.parseJSON(response.content, {
        strengths: [],
        weaknesses: [],
        differentiators: []
      });
    } catch (error) {
      console.error('Strengths/weaknesses extraction error:', error);
      return { strengths: [], weaknesses: [], differentiators: [] };
    }
  }

  private async extractFeatureInsights(content: string): Promise<FeatureInsights> {
    try {
      const aiProvider = createAIProvider(['openai', 'google', 'groq']);
      const response = await aiProvider.generateCompletion([
        { role: 'system', content: ciPrompts.featureComparison },
        { role: 'user', content }
      ], { jsonMode: true });

      return this.parseJSON(response.content, {
        coreFeatures: [],
        popularUseCases: [],
        integrations: [],
        technicalStack: ''
      });
    } catch (error) {
      console.error('Feature extraction error:', error);
      return { coreFeatures: [], popularUseCases: [], integrations: [], technicalStack: '' };
    }
  }

  private parseJSON<T>(content: string, fallback: T): T {
    try {
      // Try direct parse
      return JSON.parse(content);
    } catch {
      // Try extracting from code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          return fallback;
        }
      }
      return fallback;
    }
  }

  private analyzeSentiment(data: CIResearchData): {
    overall: 'positive' | 'neutral' | 'negative';
    score: number;
  } {
    let positiveSignals = 0;
    let negativeSignals = 0;
    let totalSignals = 0;

    // Reddit sentiment
    data.redditPosts.forEach(post => {
      if (post.upvotes > 50) positiveSignals += 2;
      else if (post.upvotes > 10) positiveSignals += 1;
      else if (post.upvotes < 5) negativeSignals += 1;
      totalSignals += 1;
    });

    // Stack Overflow sentiment
    data.stackOverflowAnswers.forEach(answer => {
      if (answer.accepted) positiveSignals += 2;
      if (answer.votes > 20) positiveSignals += 2;
      else if (answer.votes > 5) positiveSignals += 1;
      totalSignals += 1;
    });

    // GitHub issues sentiment (open issues = negative)
    data.gitHubIssues.forEach(issue => {
      if (issue.state === 'open') negativeSignals += 1;
      else positiveSignals += 1;
      totalSignals += 1;
    });

    // YouTube sentiment
    data.youtubeVideos.forEach(video => {
      if (video.views && video.views > 10000) positiveSignals += 1;
      totalSignals += 1;
    });

    const score = totalSignals > 0 ? (positiveSignals - negativeSignals) / totalSignals : 0;
    const overall = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';

    return { overall, score };
  }

  private getTotalSources(data: CIResearchData): number {
    return data.redditPosts.length + data.stackOverflowAnswers.length + 
           data.gitHubIssues.length + data.youtubeVideos.length + 
           data.devToArticles.length + data.forumPosts.length;
  }

  private determineMarketPosition(data: CIResearchData, sentiment: { overall: string; score: number }): string {
    const total = this.getTotalSources(data);
    const youtubeViews = data.youtubeVideos.reduce((sum, v) => sum + (v.views || 0), 0);
    
    if (total > 50 && sentiment.overall === 'positive') {
      return 'Established market leader with strong community adoption';
    } else if (total > 30 && youtubeViews > 50000) {
      return 'Growing platform with increasing developer mindshare';
    } else if (total > 15) {
      return 'Mid-market player with active community';
    } else {
      return 'Emerging or niche platform';
    }
  }

  private inferTargetCustomers(useCases: string[]): string {
    const enterprise = useCases.some(uc => 
      uc.toLowerCase().includes('enterprise') || 
      uc.toLowerCase().includes('large scale') ||
      uc.toLowerCase().includes('corporate')
    );
    
    const startup = useCases.some(uc => 
      uc.toLowerCase().includes('startup') || 
      uc.toLowerCase().includes('small business') ||
      uc.toLowerCase().includes('indie')
    );
    
    if (enterprise && startup) return 'All company sizes from startups to enterprise';
    if (enterprise) return 'Enterprise and mid-market companies';
    if (startup) return 'Startups and small businesses';
    return 'Developers and technical teams';
  }
}

// Export singleton instance
export const ciInsightExtractor = new CIInsightExtractor();
