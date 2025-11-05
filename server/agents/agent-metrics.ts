// Agent-specific performance monitoring and metrics
import { monitoring } from '../monitoring';

export interface AgentMetrics {
  agentName: string;
  executionTime: number;
  success: boolean;
  error?: string;
  timestamp: Date;
  context?: {
    product?: string;
    url?: string;
    complexity?: string;
  };
  results?: {
    itemsProcessed?: number;
    sourcesFound?: number;
    qualityScore?: number;
  };
}

export interface RefinementMetrics {
  attempt: number;
  qualityScore: number;
  issuesFound: string[];
  fixesApplied: string[];
  duration: number;
  timestamp: Date;
}

export class AgentMetricsService {
  private static agentMetrics: AgentMetrics[] = [];
  private static refinementMetrics: RefinementMetrics[] = [];
  private static maxMetrics = 500;

  /**
   * Record agent execution metrics
   */
  static recordAgentExecution(metrics: AgentMetrics) {
    this.agentMetrics.push(metrics);
    
    // Keep only recent metrics
    if (this.agentMetrics.length > this.maxMetrics) {
      this.agentMetrics = this.agentMetrics.slice(-this.maxMetrics);
    }

    // Also record in main monitoring system
    monitoring.recordMetric(
      `agent.${metrics.agentName}`,
      metrics.executionTime,
      metrics.success,
      metrics.error,
      {
        product: metrics.context?.product,
        sourcesFound: metrics.results?.sourcesFound,
        qualityScore: metrics.results?.qualityScore
      }
    );

    // Log warnings for slow agents
    if (metrics.executionTime > 30000) {
      console.warn(`[AGENT METRICS] ${metrics.agentName} took ${metrics.executionTime}ms (slow execution)`);
    }
  }

  /**
   * Record refinement cycle metrics
   */
  static recordRefinement(metrics: RefinementMetrics) {
    this.refinementMetrics.push(metrics);
    
    if (this.refinementMetrics.length > this.maxMetrics) {
      this.refinementMetrics = this.refinementMetrics.slice(-this.maxMetrics);
    }

    monitoring.recordMetric(
      'agent.refinement',
      metrics.duration,
      true,
      undefined,
      {
        attempt: metrics.attempt,
        qualityScore: metrics.qualityScore,
        issuesFound: metrics.issuesFound.length
      }
    );
  }

  /**
   * Get agent performance statistics
   */
  static getAgentStats(agentName?: string) {
    const filtered = agentName
      ? this.agentMetrics.filter(m => m.agentName === agentName)
      : this.agentMetrics;

    if (filtered.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        averageQualityScore: 0,
        errorCount: 0
      };
    }

    const successCount = filtered.filter(m => m.success).length;
    const totalExecutionTime = filtered.reduce((sum, m) => sum + m.executionTime, 0);
    const qualityScores = filtered
      .filter(m => m.results?.qualityScore !== undefined)
      .map(m => m.results!.qualityScore!);
    const averageQualityScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 0;

    return {
      totalExecutions: filtered.length,
      successRate: (successCount / filtered.length) * 100,
      averageExecutionTime: totalExecutionTime / filtered.length,
      averageQualityScore,
      errorCount: filtered.filter(m => !m.success).length,
      recentErrors: filtered
        .filter(m => !m.success)
        .slice(-5)
        .map(m => ({ agent: m.agentName, error: m.error, timestamp: m.timestamp }))
    };
  }

  /**
   * Get refinement statistics
   */
  static getRefinementStats() {
    if (this.refinementMetrics.length === 0) {
      return {
        totalRefinements: 0,
        averageAttempts: 0,
        averageQualityImprovement: 0,
        commonIssues: []
      };
    }

    const totalAttempts = this.refinementMetrics.reduce((sum, m) => sum + m.attempt, 0);
    const allIssues = this.refinementMetrics.flatMap(m => m.issuesFound);
    const issueFrequency = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([issue, count]) => ({ issue, count }));

    // Calculate quality improvement (final score - initial score)
    const qualityImprovements = this.refinementMetrics
      .filter(m => m.attempt > 1)
      .map(m => m.qualityScore);

    const averageQualityImprovement = qualityImprovements.length > 0
      ? qualityImprovements.reduce((sum, score) => sum + score, 0) / qualityImprovements.length
      : 0;

    return {
      totalRefinements: this.refinementMetrics.length,
      averageAttempts: totalAttempts / this.refinementMetrics.length,
      averageQualityImprovement,
      commonIssues
    };
  }

  /**
   * Get overall agent system health
   */
  static getSystemHealth() {
    const recentMetrics = this.agentMetrics.filter(
      m => m.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    if (recentMetrics.length === 0) {
      return { 
        status: 'unknown' as const, 
        message: 'No recent agent activity',
        details: {}
      };
    }

    const successRate = (recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100;
    const avgExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length;
    const avgQualityScore = recentMetrics
      .filter(m => m.results?.qualityScore !== undefined)
      .reduce((sum, m, _i, arr) => sum + m.results!.qualityScore! / arr.length, 0);

    // Agent-specific breakdown
    const agentBreakdown = {
      research: this.getAgentStats('research'),
      code: this.getAgentStats('code'),
      structure: this.getAgentStats('structure'),
      critic: this.getAgentStats('critic')
    };

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = '';

    if (successRate < 80) {
      status = 'unhealthy';
      message = `Low success rate: ${successRate.toFixed(1)}%`;
    } else if (avgExecutionTime > 45000) {
      status = 'degraded';
      message = `Slow execution: ${(avgExecutionTime / 1000).toFixed(1)}s average`;
    } else if (avgQualityScore < 70 && avgQualityScore > 0) {
      status = 'degraded';
      message = `Low quality scores: ${avgQualityScore.toFixed(1)} average`;
    } else {
      message = `Healthy: ${successRate.toFixed(1)}% success, ${(avgExecutionTime / 1000).toFixed(1)}s avg, quality ${avgQualityScore.toFixed(1)}`;
    }

    return {
      status,
      message,
      details: {
        successRate,
        avgExecutionTime,
        avgQualityScore,
        agentBreakdown,
        totalExecutions: recentMetrics.length
      }
    };
  }

  /**
   * Export metrics for analysis
   */
  static exportMetrics() {
    return {
      agentMetrics: this.agentMetrics,
      refinementMetrics: this.refinementMetrics,
      stats: {
        research: this.getAgentStats('research'),
        code: this.getAgentStats('code'),
        structure: this.getAgentStats('structure'),
        critic: this.getAgentStats('critic'),
        overall: this.getAgentStats(),
        refinement: this.getRefinementStats()
      },
      systemHealth: this.getSystemHealth()
    };
  }

  /**
   * Clear old metrics (for cleanup)
   */
  static clearOldMetrics(olderThanHours: number = 24) {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.agentMetrics = this.agentMetrics.filter(m => m.timestamp > cutoff);
    this.refinementMetrics = this.refinementMetrics.filter(m => m.timestamp > cutoff);
  }
}

// Export singleton
export const agentMetrics = AgentMetricsService;
