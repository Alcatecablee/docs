/**
 * Agent Orchestrator
 * Coordinates parallel execution of specialist agents
 */

import { AgentContext, AgentResult, CombinedAgentResults, ResearchResult, CodeResult, StructureResult, CriticResult, RefinementContext } from './types';
import { ResearchAgent } from './research-agent';
import { CodeAgent } from './code-agent';
import { StructureAgent } from './structure-agent';
import { CriticAgent } from './critic-agent';
import { BaseAgent } from './base-agent';

export class AgentOrchestrator {
  private researchAgent: ResearchAgent;
  private codeAgent: CodeAgent;
  private structureAgent: StructureAgent;
  private criticAgent: CriticAgent;
  private enableRefinement: boolean;
  private qualityThreshold: number;
  private maxRefinementAttempts: number;

  constructor(config?: {
    enableRefinement?: boolean;
    qualityThreshold?: number;
    maxRefinementAttempts?: number;
  }) {
    this.researchAgent = new ResearchAgent();
    this.codeAgent = new CodeAgent();
    this.structureAgent = new StructureAgent();
    this.criticAgent = new CriticAgent();
    
    this.enableRefinement = config?.enableRefinement ?? true;
    this.qualityThreshold = config?.qualityThreshold ?? 85;
    this.maxRefinementAttempts = config?.maxRefinementAttempts ?? 2;
    
    console.log(`🎭 Agent Orchestrator initialized (Refinement: ${this.enableRefinement ? 'ON' : 'OFF'}, Threshold: ${this.qualityThreshold}/100)`);
  }

  /**
   * Execute all three agents in parallel
   */
  async executeParallel(context: AgentContext): Promise<CombinedAgentResults> {
    const startTime = Date.now();
    console.log(`🚀 Launching 3 agents in parallel for session ${context.sessionId}`);

    try {
      // Execute all agents in parallel with individual timeouts
      const results = await Promise.allSettled([
        this.executeAgentSafely(this.researchAgent, context, 'Research'),
        this.executeAgentSafely(this.codeAgent, context, 'Code'),
        this.executeAgentSafely(this.structureAgent, context, 'Structure')
      ]);

      // Extract results and handle failures
      const [researchResult, codeResult, structureResult] = results;
      
      const research = this.extractResult<ResearchResult>(researchResult, 'Research');
      const code = this.extractResult<CodeResult>(codeResult, 'Code');
      const structure = this.extractResult<StructureResult>(structureResult, 'Structure');

      // Determine overall status
      const failedAgents: string[] = [];
      if (!research.success) failedAgents.push('Research');
      if (!code.success) failedAgents.push('Code');
      if (!structure.success) failedAgents.push('Structure');

      const status = failedAgents.length === 0 ? 'success' 
                   : failedAgents.length === 3 ? 'failed'
                   : 'partial';

      const parallelTime = Date.now() - startTime;

      console.log(`✅ Parallel agents completed in ${parallelTime}ms - Status: ${status}`);
      if (failedAgents.length > 0) {
        console.log(`⚠️  Failed agents: ${failedAgents.join(', ')}`);
      }

      // Execute Critic Agent sequentially after parallel agents
      let critic: CriticResult | undefined;
      if (status !== 'failed') {
        try {
          console.log(`  🔍 Critic Agent validating quality...`);
          const preliminaryResults: CombinedAgentResults = {
            research,
            code,
            structure,
            executionTime: parallelTime,
            status,
            failedAgents: failedAgents.length > 0 ? failedAgents : undefined
          };
          
          critic = await this.criticAgent.execute(context, preliminaryResults);
          console.log(`  ✅ Critic Agent completed - Quality Score: ${critic.data.qualityScore}/100`);
        } catch (error: any) {
          console.warn(`  ⚠️  Critic Agent failed: ${error.message} - Continuing without quality validation`);
          critic = undefined;
        }
      }

      const totalExecutionTime = Date.now() - startTime;

      return {
        research,
        code,
        structure,
        critic,
        executionTime: totalExecutionTime,
        status,
        failedAgents: failedAgents.length > 0 ? failedAgents : undefined
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Agent orchestration failed after ${executionTime}ms:`, error);
      
      // Return with all agents failed
      return {
        research: this.getEmptyResearchResult(),
        code: this.getEmptyCodeResult(),
        structure: this.getEmptyStructureResult(context),
        executionTime,
        status: 'failed',
        failedAgents: ['Research', 'Code', 'Structure']
      };
    }
  }

  /**
   * Execute agents with automatic quality-based refinement
   * This is the main entry point that includes the refinement loop
   */
  async executeWithRefinement(context: AgentContext): Promise<CombinedAgentResults> {
    if (!this.enableRefinement) {
      console.log('🔄 Refinement disabled, executing agents once');
      return this.executeParallel(context);
    }

    const overallStartTime = Date.now();
    let attempt = 0;
    let bestResults: CombinedAgentResults | null = null;
    let bestQualityScore = 0;

    console.log(`🔄 Starting refinement loop (max ${this.maxRefinementAttempts} attempts, threshold ${this.qualityThreshold}/100)`);

    while (attempt < this.maxRefinementAttempts) {
      attempt++;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔄 Refinement Attempt ${attempt}/${this.maxRefinementAttempts}`);
      console.log(`${'='.repeat(80)}\n`);

      // Execute agents
      const results = await this.executeParallel(context);

      // Track best results
      const currentScore = results.critic?.data.qualityScore || 0;
      if (currentScore > bestQualityScore) {
        bestQualityScore = currentScore;
        bestResults = results;
      }

      // Check if quality meets threshold
      if (currentScore >= this.qualityThreshold) {
        const totalTime = Date.now() - overallStartTime;
        console.log(`\n✅ Quality threshold met! Score: ${currentScore}/100 (after ${attempt} attempt(s), ${totalTime}ms)`);
        return results;
      }

      // If this was the last attempt, return best results
      if (attempt >= this.maxRefinementAttempts) {
        const totalTime = Date.now() - overallStartTime;
        console.log(`\n⚠️  Max refinement attempts reached. Best score: ${bestQualityScore}/100 (${totalTime}ms)`);
        return bestResults || results;
      }

      // Prepare refinement context for next iteration
      if (results.critic) {
        const refinementContext: RefinementContext = {
          attempt,
          previousQualityScore: currentScore,
          suggestions: results.critic.data.suggestions,
          missingContent: results.critic.data.missingContent,
          focusAreas: results.critic.data.issues
            .filter(i => i.severity === 'high')
            .map(i => i.description)
        };

        context.refinementContext = refinementContext;

        console.log(`\n📋 Refinement needed (Score: ${currentScore}/${this.qualityThreshold})`);
        console.log(`   Issues found: ${results.critic.data.issues.length}`);
        console.log(`   Missing content: ${results.critic.data.missingContent.length}`);
        console.log(`   Focus areas: ${refinementContext.focusAreas.slice(0, 3).join(', ')}${refinementContext.focusAreas.length > 3 ? '...' : ''}`);
        console.log(`\n🔁 Retrying with refinement guidance...\n`);
      } else {
        // Allow one more retry even without critic feedback (resilience for transient failures)
        console.log(`\n⚠️  No critic feedback available (attempt ${attempt}/${this.maxRefinementAttempts})`);
        if (attempt < this.maxRefinementAttempts) {
          console.log(`   🔁 Retrying once more to handle transient failures...\n`);
        } else {
          console.log(`   ⛔ Cannot refine further without critic feedback`);
          return bestResults || results;
        }
      }
    }

    // Should never reach here, but TypeScript needs it
    return bestResults || this.getEmptyAgentResults(context);
  }

  /**
   * Get completely empty agent results (fallback)
   */
  private getEmptyAgentResults(context: AgentContext): CombinedAgentResults {
    return {
      research: this.getEmptyResearchResult(),
      code: this.getEmptyCodeResult(),
      structure: this.getEmptyStructureResult(context),
      executionTime: 0,
      status: 'failed',
      failedAgents: ['Research', 'Code', 'Structure']
    };
  }

  /**
   * Execute a single agent with timeout and error handling
   */
  private async executeAgentSafely<T extends AgentResult>(
    agent: BaseAgent<T>,
    context: AgentContext,
    agentName: string
  ): Promise<T> {
    try {
      console.log(`  ⏳ ${agentName} Agent starting...`);
      const result = await agent.executeWithTimeout(context);
      console.log(`  ✅ ${agentName} Agent completed (${result.executionTime}ms)`);
      return result;
    } catch (error: any) {
      console.error(`  ❌ ${agentName} Agent failed:`, error.message);
      throw error;
    }
  }

  /**
   * Extract result from Promise.allSettled result
   */
  private extractResult<T extends AgentResult>(
    result: PromiseSettledResult<T>,
    agentName: string
  ): T {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.warn(`⚠️  ${agentName} agent rejected:`, result.reason);
      // Return a default error result based on agent type
      throw result.reason;
    }
  }

  /**
   * Get empty research result (fallback)
   */
  private getEmptyResearchResult(): ResearchResult {
    return {
      agentName: 'Research Agent',
      executionTime: 0,
      success: false,
      error: 'Agent failed',
      data: {
        issues: [],
        solutions: [],
        useCases: [],
        communityInsights: {
          sentiment: 'neutral',
          popularityTrend: 'stable',
          commonPainPoints: []
        },
        sources: []
      }
    };
  }

  /**
   * Get empty code result (fallback)
   */
  private getEmptyCodeResult(): CodeResult {
    return {
      agentName: 'Code Agent',
      executionTime: 0,
      success: false,
      error: 'Agent failed',
      data: {
        quickStart: [],
        apiExamples: [],
        integrationExamples: [],
        commonPatterns: []
      }
    };
  }

  /**
   * Get empty structure result (fallback)
   */
  private getEmptyStructureResult(context: AgentContext): StructureResult {
    return {
      agentName: 'Structure Agent',
      executionTime: 0,
      success: false,
      error: 'Agent failed',
      data: {
        outline: [
          {
            id: 'introduction',
            title: 'Introduction',
            description: `Overview of ${context.product}`,
            priority: 1
          }
        ],
        navigation: [],
        contentGaps: [],
        recommendedSections: [],
        pageCount: 0
      }
    };
  }

  /**
   * Execute agents sequentially (fallback mode)
   */
  async executeSequential(context: AgentContext): Promise<CombinedAgentResults> {
    const startTime = Date.now();
    console.log(`🔄 Executing agents sequentially (fallback mode)`);

    const failedAgents: string[] = [];

    // Execute research agent
    let research: ResearchResult;
    try {
      research = await this.researchAgent.executeWithTimeout(context);
    } catch (error) {
      console.error('Research agent failed:', error);
      research = this.getEmptyResearchResult();
      failedAgents.push('Research');
    }

    // Execute code agent
    let code: CodeResult;
    try {
      code = await this.codeAgent.executeWithTimeout(context);
    } catch (error) {
      console.error('Code agent failed:', error);
      code = this.getEmptyCodeResult();
      failedAgents.push('Code');
    }

    // Execute structure agent
    let structure: StructureResult;
    try {
      structure = await this.structureAgent.executeWithTimeout(context);
    } catch (error) {
      console.error('Structure agent failed:', error);
      structure = this.getEmptyStructureResult(context);
      failedAgents.push('Structure');
    }

    const executionTime = Date.now() - startTime;
    const status = failedAgents.length === 0 ? 'success'
                 : failedAgents.length === 3 ? 'failed'
                 : 'partial';

    console.log(`✅ Sequential execution completed in ${executionTime}ms`);

    return {
      research,
      code,
      structure,
      executionTime,
      status,
      failedAgents: failedAgents.length > 0 ? failedAgents : undefined
    };
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator();
