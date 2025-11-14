/**
 * Battlecard Orchestrator
 * Coordinates competitive intelligence research → extraction → PDF generation → storage
 */

import { searchService } from './search-service';
import { ciInsightExtractor, CIResearchData } from './ci-insight-extractor';
import { battlecardGenerator, BattlecardData } from './battlecard-generator';
import { storage } from './storage';
import { db } from './db';
import { battlecards } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { progressTracker } from './progress-tracker';
import { qualityScoringService } from './quality-scoring-service';
import crypto from 'crypto';

export interface BattlecardRequest {
  competitorName: string;
  competitorUrl?: string;
  userId?: number | null;
}

export interface BattlecardResult {
  battlecardId: number;
  pdfUrl: string;
  data: BattlecardData;
  qualityScore: number;
  totalSources: number;
}

export class BattlecardOrchestrator {
  /**
   * Generate complete battlecard from competitor name
   */
  async generateBattlecard(
    request: BattlecardRequest,
    sessionId?: string
  ): Promise<BattlecardResult> {
    const effectiveSessionId = sessionId || `bc_${Math.random().toString(36).slice(2)}`;
    
    console.log(`🎯 Starting battlecard generation for ${request.competitorName}`);
    
    try {
      // Check for existing battlecard (deduplication)
      const requestHash = this.generateRequestHash(request.competitorName);
      const existing = await this.findExistingBattlecard(requestHash);
      
      if (existing) {
        console.log(`✅ Found existing battlecard for ${request.competitorName}`);
        progressTracker.emitActivity(effectiveSessionId, {
          message: `Found existing battlecard from ${new Date(existing.created_at!).toLocaleDateString()}`,
          type: 'info'
        });
        
        return {
          battlecardId: existing.id,
          pdfUrl: existing.pdf_url || '',
          data: existing.payload as BattlecardData,
          qualityScore: parseFloat(existing.quality_score || '0'),
          totalSources: existing.total_sources
        };
      }

      // Create database record
      if (!db) throw new Error('Database not initialized');
      
      const [battlecard] = await db.insert(battlecards).values({
        competitor_name: request.competitorName,
        competitor_url: request.competitorUrl || null,
        user_id: request.userId || null,
        request_hash: requestHash,
        payload: {},
        status: 'processing',
        total_sources: 0
      }).returning();

      progressTracker.emitActivity(effectiveSessionId, {
        message: `Researching ${request.competitorName} across Reddit, GitHub, Stack Overflow, YouTube...`,
        type: 'info'
      }, 1, 'Research');

      // Step 1: Multi-source research
      const researchData = await this.performResearch(request.competitorName, effectiveSessionId);

      progressTracker.emitActivity(effectiveSessionId, {
        message: `Found ${this.getTotalSources(researchData)} sources. Analyzing competitive intelligence...`,
        type: 'success'
      }, 2, 'Analysis');

      // Step 2: Extract competitive intelligence insights
      const battlecardData = await ciInsightExtractor.extractInsights(
        request.competitorName,
        researchData
      );

      progressTracker.emitActivity(effectiveSessionId, {
        message: `Extracted pricing, strengths, weaknesses, and sentiment. Generating PDF...`,
        type: 'success'
      }, 3, 'PDF Generation');

      // Step 3: Generate PDF
      const pdfBuffer = await battlecardGenerator.generatePDF(battlecardData);

      progressTracker.emitActivity(effectiveSessionId, {
        message: `PDF generated (${Math.round(pdfBuffer.length / 1024)}KB). Uploading...`,
        type: 'success'
      }, 4, 'Upload');

      // Step 4: Store PDF (for now, we'll store as base64 in the database or serve directly)
      // TODO: Implement proper S3/storage upload in production
      const pdfUrl = `/api/battlecards/${battlecard.id}/pdf`;

      progressTracker.emitActivity(effectiveSessionId, {
        message: `Battlecard complete! Calculating quality score...`,
        type: 'success'
      }, 5, 'Finalization');

      // Step 5: Calculate quality score
      const qualityScore = this.calculateQualityScore(researchData, battlecardData);

      // Step 6: Update database record
      if (!db) throw new Error('Database not initialized');
      
      await db.update(battlecards)
        .set({
          payload: battlecardData,
          pdf_url: pdfUrl,
          pdf_size_bytes: pdfBuffer.length,
          quality_score: qualityScore.toString(),
          total_sources: this.getTotalSources(researchData),
          reddit_sources: researchData.redditPosts.length,
          stackoverflow_sources: researchData.stackOverflowAnswers.length,
          github_sources: researchData.gitHubIssues.length,
          youtube_sources: researchData.youtubeVideos.length,
          status: 'completed',
          completed_at: new Date(),
          updated_at: new Date()
        })
        .where(eq(battlecards.id, battlecard.id));

      console.log(`✅ Battlecard generated successfully with quality score ${qualityScore}`);

      return {
        battlecardId: battlecard.id,
        pdfUrl,
        data: battlecardData,
        qualityScore,
        totalSources: this.getTotalSources(researchData)
      };

    } catch (error: any) {
      console.error('Battlecard generation error:', error);
      progressTracker.emitActivity(effectiveSessionId, {
        message: `Error: ${error.message}`,
        type: 'error'
      });
      throw error;
    }
  }

  /**
   * Perform comprehensive multi-source research
   */
  private async performResearch(competitorName: string, sessionId: string): Promise<CIResearchData> {
    try {
      console.log(`🔍 Performing multi-source research for ${competitorName}...`);
      
      // Use the existing comprehensive search service that scrapes all sources
      const research = await searchService.performComprehensiveResearch(
        competitorName,
        '', // No URL needed for competitor research  
        'large', // Product size for comprehensive coverage
        0, // crawledPageCount (will be estimated by service)
        true, // YouTube API access
        false // No transcripts needed for battlecards
      );

      console.log(`✅ Research complete: ${research.totalSources} total sources found`);
      console.log(`   - Reddit: ${research.redditPosts?.length || 0}`);
      console.log(`   - Stack Overflow: ${research.stackOverflowAnswers?.length || 0}`);
      console.log(`   - GitHub: ${research.gitHubIssues?.length || 0}`);
      console.log(`   - YouTube: ${research.youtubeVideos?.length || 0}`);
      console.log(`   - DEV.to: ${research.devToArticles?.length || 0}`);
      console.log(`   - Forums: ${research.forumPosts?.length || 0}`);

      // Validate we got real data
      const totalSources = (research.redditPosts?.length || 0) + 
                          (research.stackOverflowAnswers?.length || 0) + 
                          (research.gitHubIssues?.length || 0) + 
                          (research.youtubeVideos?.length || 0);
      
      if (totalSources === 0) {
        throw new Error(`No sources found for ${competitorName}. This competitor may not have significant online presence.`);
      }

      return {
        stackOverflowAnswers: research.stackOverflowAnswers || [],
        gitHubIssues: research.gitHubIssues || [],
        youtubeVideos: research.youtubeVideos || [],
        redditPosts: research.redditPosts || [],
        devToArticles: research.devToArticles || [],
        forumPosts: research.forumPosts || []
      };
    } catch (error: any) {
      console.error(`❌ Research error for ${competitorName}:`, error);
      throw new Error(`Failed to research ${competitorName}: ${error.message}`);
    }
  }

  /**
   * Calculate quality score based on data completeness and source diversity
   */
  private calculateQualityScore(researchData: CIResearchData, battlecardData: BattlecardData): number {
    let score = 0;

    // Source diversity (40 points)
    const sourceTypes = [
      researchData.redditPosts.length > 0,
      researchData.stackOverflowAnswers.length > 0,
      researchData.gitHubIssues.length > 0,
      researchData.youtubeVideos.length > 0,
      researchData.devToArticles.length > 0,
      researchData.forumPosts.length > 0
    ].filter(Boolean).length;
    score += (sourceTypes / 6) * 40;

    // Source quantity (30 points)
    const totalSources = this.getTotalSources(researchData);
    if (totalSources >= 50) score += 30;
    else if (totalSources >= 30) score += 20;
    else if (totalSources >= 15) score += 10;
    else score += (totalSources / 15) * 10;

    // Data completeness (30 points)
    let completeness = 0;
    if (battlecardData.pricing.tiers.length > 0) completeness += 5;
    if (battlecardData.pricing.complaints.length > 0) completeness += 5;
    if (battlecardData.strengths.length >= 3) completeness += 5;
    if (battlecardData.weaknesses.length >= 3) completeness += 5;
    if (battlecardData.customerSentiment.commonComplaints.length > 0) completeness += 5;
    if (battlecardData.customerSentiment.migrationSignals.length > 0) completeness += 5;
    score += completeness;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Generate hash for deduplication
   */
  private generateRequestHash(competitorName: string): string {
    return crypto
      .createHash('sha256')
      .update(competitorName.toLowerCase().trim())
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Find existing battlecard by hash
   */
  private async findExistingBattlecard(requestHash: string) {
    if (!db) return null;
    
    const results = await db
      .select()
      .from(battlecards)
      .where(eq(battlecards.request_hash, requestHash))
      .limit(1);
    
    return results[0] || null;
  }

  /**
   * Get total sources count
   */
  private getTotalSources(data: CIResearchData): number {
    return (
      data.redditPosts.length +
      data.stackOverflowAnswers.length +
      data.gitHubIssues.length +
      data.youtubeVideos.length +
      data.devToArticles.length +
      data.forumPosts.length
    );
  }

  /**
   * Get battlecard by ID
   */
  async getBattlecard(id: number) {
    if (!db) throw new Error('Database not initialized');
    
    const results = await db
      .select()
      .from(battlecards)
      .where(eq(battlecards.id, id))
      .limit(1);
    
    if (results.length === 0) {
      throw new Error(`Battlecard ${id} not found`);
    }

    return results[0];
  }

  /**
   * List user's battlecards
   */
  async listBattlecards(userId?: number | null, limit: number = 20) {
    if (!db) throw new Error('Database not initialized');
    
    if (userId) {
      return await db
        .select()
        .from(battlecards)
        .where(eq(battlecards.user_id, userId))
        .orderBy(battlecards.created_at)
        .limit(limit);
    } else {
      return await db
        .select()
        .from(battlecards)
        .orderBy(battlecards.created_at)
        .limit(limit);
    }
  }
}

export const battlecardOrchestrator = new BattlecardOrchestrator();
