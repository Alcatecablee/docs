/**
 * Agent Orchestrator
 * Coordinates parallel execution of specialist agents
 */

import { AgentContext, AgentResult, CombinedAgentResults, ResearchResult, CodeResult, StructureResult } from './types';
import { ResearchAgent } from './research-agent';
import { CodeAgent } from './code-agent';
import { StructureAgent } from './structure-agent';
import { BaseAgent } from './base-agent';

export class AgentOrchestrator {
  private researchAgent: ResearchAgent;
  private codeAgent: CodeAgent;
  private structureAgent: StructureAgent;

  constructor() {
    this.researchAgent = new ResearchAgent();
    this.codeAgent = new CodeAgent();
    this.structureAgent = new StructureAgent();
    
    console.log('🎭 Agent Orchestrator initialized');
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

      const executionTime = Date.now() - startTime;

      console.log(`✅ Agents completed in ${executionTime}ms - Status: ${status}`);
      if (failedAgents.length > 0) {
        console.log(`⚠️  Failed agents: ${failedAgents.join(', ')}`);
      }

      return {
        research,
        code,
        structure,
        executionTime,
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
