/**
 * Pipeline Monitoring & Debug Dashboard
 * Provides real-time tracking of documentation generation stages
 */

export interface PipelineStage {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
  startTime?: number;
  endTime?: number;
  progress: number; // 0-100
  details?: StageDetails;
  error?: string;
}

export interface StageDetails {
  itemsProcessed?: number;
  itemsTotal?: number;
  itemsFailed?: number;
  sources?: SourceAttribution[];
  warnings?: string[];
  metrics?: Record<string, any>;
}

export interface SourceAttribution {
  url: string;
  title: string;
  type: 'stackoverflow' | 'github' | 'documentation' | 'blog' | 'other';
  quality: number;
  used: boolean;
  reason?: string;
}

export interface PipelineReport {
  sessionId: string;
  stages: PipelineStage[];
  overallQuality: number;
  pipelineStatus?: 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  sourcesUsed: number;
  sourcesMissing: string[];
  recommendations: string[];
}

import { LRUCache } from 'lru-cache';

class PipelineMonitor {
  private reports = new LRUCache<string, PipelineReport>({
    max: 1000, // Maximum 1000 pipeline reports
    ttl: 24 * 60 * 60 * 1000, // 24 hours TTL
    updateAgeOnGet: false, // Don't refresh TTL on access
  });
  
  /**
   * Initialize a new pipeline tracking session
   */
  startPipeline(sessionId: string): PipelineReport {
    const report: PipelineReport = {
      sessionId,
      stages: this.initializeStages(),
      overallQuality: 0,
      pipelineStatus: 'running',
      startTime: Date.now(),
      sourcesUsed: 0,
      sourcesMissing: [],
      recommendations: [],
    };
    
    this.reports.set(sessionId, report);
    console.log(`📊 Pipeline started: ${sessionId}`);
    return report;
  }
  
  /**
   * Initialize all pipeline stages
   */
  private initializeStages(): PipelineStage[] {
    return [
      {
        id: 1,
        name: 'Site Discovery',
        description: 'Crawling website and mapping content',
        status: 'pending',
        progress: 0,
      },
      {
        id: 2,
        name: 'Content Extraction',
        description: 'Extracting content from multiple pages',
        status: 'pending',
        progress: 0,
      },
      {
        id: 3,
        name: 'External Research',
        description: 'Gathering insights from Stack Overflow, GitHub, etc.',
        status: 'pending',
        progress: 0,
      },
      {
        id: 4,
        name: 'Source Quality Scoring',
        description: 'Validating and scoring information sources',
        status: 'pending',
        progress: 0,
      },
      {
        id: 5,
        name: 'AI Synthesis',
        description: 'Generating comprehensive documentation',
        status: 'pending',
        progress: 0,
      },
      {
        id: 6,
        name: 'Quality Validation',
        description: 'Verifying content accuracy and completeness',
        status: 'pending',
        progress: 0,
      },
      {
        id: 7,
        name: 'Formatting & Export',
        description: 'Finalizing documentation output',
        status: 'pending',
        progress: 0,
      },
    ];
  }
  
  /**
   * Update a specific stage
   */
  updateStage(
    sessionId: string,
    stageId: number,
    updates: Partial<PipelineStage>
  ): void {
    const report = this.reports.get(sessionId);
    if (!report) return;
    
    const stage = report.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    // Update stage
    Object.assign(stage, updates);
    
    // Set timestamps
    if (updates.status === 'in_progress' && !stage.startTime) {
      stage.startTime = Date.now();
    }
    if (updates.status === 'completed' || updates.status === 'failed') {
      stage.endTime = Date.now();
    }
    
    console.log(`📝 Stage ${stageId} (${stage.name}): ${updates.status || stage.status} - ${updates.progress || stage.progress}%`);
    
    // Emit to listeners (WebSocket, etc.)
    this.emitUpdate(sessionId, stage);
  }
  
  /**
   * Mark stage as failed with error
   */
  failStage(sessionId: string, stageId: number, error: string): void {
    this.updateStage(sessionId, stageId, {
      status: 'failed',
      error,
      progress: 0,
    });
  }
  
  /**
   * Mark stage as partially completed
   */
  partialStage(
    sessionId: string,
    stageId: number,
    progress: number,
    warnings: string[]
  ): void {
    const report = this.reports.get(sessionId);
    if (!report) return;
    
    const stage = report.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    this.updateStage(sessionId, stageId, {
      status: 'partial',
      progress,
      details: {
        ...stage.details,
        warnings,
      },
    });
  }
  
  /**
   * Add source attribution
   */
  addSource(
    sessionId: string,
    stageId: number,
    source: SourceAttribution
  ): void {
    const report = this.reports.get(sessionId);
    if (!report) return;
    
    const stage = report.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    if (!stage.details) stage.details = {};
    if (!stage.details.sources) stage.details.sources = [];
    
    stage.details.sources.push(source);
    
    if (source.used) {
      report.sourcesUsed++;
    }
  }
  
  /**
   * Complete pipeline and calculate final quality score
   */
  completePipeline(sessionId: string): PipelineReport | undefined {
    const report = this.reports.get(sessionId);
    if (!report) return undefined;
    
    report.endTime = Date.now();
    report.totalDuration = report.endTime - report.startTime;
    report.pipelineStatus = 'completed';
    
    // Calculate overall quality based on stage completion
    const completedStages = report.stages.filter(s => s.status === 'completed').length;
    const partialStages = report.stages.filter(s => s.status === 'partial').length;
    const totalStages = report.stages.length;
    
    report.overallQuality = Math.round(
      ((completedStages * 100) + (partialStages * 70)) / totalStages
    );
    
    // Generate recommendations
    this.generateRecommendations(report);
    
    console.log(`✅ Pipeline completed: ${sessionId} - Quality: ${report.overallQuality}%`);
    console.log(`⏱️  Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
    console.log(`📚 Sources used: ${report.sourcesUsed}`);
    
    return report;
  }
  
  /**
   * Mark pipeline as failed (for timeouts, crashes, critical errors)
   */
  failPipeline(sessionId: string, errorMessage: string): PipelineReport | undefined {
    const report = this.reports.get(sessionId);
    if (!report) return undefined;
    
    report.endTime = Date.now();
    report.totalDuration = report.endTime - report.startTime;
    report.pipelineStatus = 'failed';
    report.overallQuality = 0;
    
    // Add failure recommendation
    report.recommendations.push(`Pipeline failed: ${errorMessage}`);
    
    // Count failed stages for additional context
    const failedStages = report.stages.filter(s => s.status === 'failed').length;
    if (failedStages > 0) {
      report.recommendations.push(
        `${failedStages} stage(s) failed. Consider re-running with different API providers.`
      );
    }
    
    console.log(`❌ Pipeline failed: ${sessionId} - ${errorMessage}`);
    console.log(`⏱️  Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
    
    return report;
  }
  
  /**
   * Generate recommendations based on pipeline results
   */
  private generateRecommendations(report: PipelineReport): void {
    const failed = report.stages.filter(s => s.status === 'failed');
    const partial = report.stages.filter(s => s.status === 'partial');
    
    if (failed.length > 0) {
      report.recommendations.push(
        `${failed.length} stage(s) failed. Consider re-running with different API providers.`
      );
    }
    
    if (partial.length > 0) {
      report.recommendations.push(
        `${partial.length} stage(s) had partial success. Review warnings for details.`
      );
    }
    
    if (report.sourcesMissing.length > 0) {
      report.recommendations.push(
        `Missing sources: ${report.sourcesMissing.join(', ')}. Add API keys to improve coverage.`
      );
    }
    
    if (report.overallQuality < 85) {
      report.recommendations.push(
        'Quality score below 85%. Consider enabling more data sources or re-running failed stages.'
      );
    }
  }
  
  /**
   * Get current pipeline status
   */
  getReport(sessionId: string): PipelineReport | undefined {
    return this.reports.get(sessionId);
  }
  
  /**
   * Get all pipeline reports
   */
  getAllReports(): PipelineReport[] {
    return Array.from(this.reports.values());
  }
  
  /**
   * Clean up old reports (call periodically)
   */
  cleanup(maxAgeHours = 24): void {
    const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
    
    for (const [id, report] of this.reports.entries()) {
      if (report.startTime < cutoff) {
        this.reports.delete(id);
      }
    }
  }
  
  /**
   * Emit update to listeners (implement WebSocket/SSE here)
   */
  private emitUpdate(sessionId: string, stage: PipelineStage): void {
    // This can be extended to emit WebSocket events
    // For now, just log
    const emoji = stage.status === 'completed' ? '✅' :
                  stage.status === 'failed' ? '❌' :
                  stage.status === 'partial' ? '⚠️' :
                  stage.status === 'in_progress' ? '🔄' : '⏳';
    
    console.log(`${emoji} [${sessionId.slice(0, 8)}] ${stage.name}: ${stage.description}`);
  }
  
  /**
   * Format report for display
   */
  formatReport(sessionId: string): string {
    const report = this.reports.get(sessionId);
    if (!report) return 'Report not found';
    
    let output = `\n📊 Pipeline Report: ${sessionId}\n`;
    output += `${'='.repeat(60)}\n\n`;
    
    report.stages.forEach(stage => {
      const emoji = stage.status === 'completed' ? '✅' :
                    stage.status === 'failed' ? '❌' :
                    stage.status === 'partial' ? '⚠️' :
                    stage.status === 'in_progress' ? '🔄' : '⏳';
      
      output += `${emoji} Stage ${stage.id}: ${stage.name}\n`;
      output += `   Status: ${stage.status} (${stage.progress}%)\n`;
      output += `   ${stage.description}\n`;
      
      if (stage.details?.itemsTotal) {
        output += `   Items: ${stage.details.itemsProcessed}/${stage.details.itemsTotal}`;
        if (stage.details.itemsFailed) {
          output += ` (${stage.details.itemsFailed} failed)`;
        }
        output += '\n';
      }
      
      if (stage.details?.warnings && stage.details.warnings.length > 0) {
        output += `   Warnings: ${stage.details.warnings.join(', ')}\n`;
      }
      
      if (stage.error) {
        output += `   Error: ${stage.error}\n`;
      }
      
      output += '\n';
    });
    
    output += `\n📈 Overall Quality: ${report.overallQuality}/100\n`;
    output += `📚 Sources Used: ${report.sourcesUsed}\n`;
    
    if (report.sourcesMissing.length > 0) {
      output += `❌ Missing: ${report.sourcesMissing.join(', ')}\n`;
    }
    
    if (report.recommendations.length > 0) {
      output += `\n💡 Recommendations:\n`;
      report.recommendations.forEach(rec => {
        output += `   • ${rec}\n`;
      });
    }
    
    return output;
  }
}

// Export singleton instance
export const pipelineMonitor = new PipelineMonitor();

// Auto-cleanup every 6 hours
setInterval(() => pipelineMonitor.cleanup(), 6 * 60 * 60 * 1000);
