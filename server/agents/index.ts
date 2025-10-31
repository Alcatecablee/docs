/**
 * Agent System Exports
 * Main entry point for the 3-agent parallel architecture
 */

export { BaseAgent } from './base-agent';
export { ResearchAgent } from './research-agent';
export { CodeAgent } from './code-agent';
export { StructureAgent } from './structure-agent';
export { AgentOrchestrator, agentOrchestrator } from './orchestrator';

export type {
  AgentContext,
  AgentResult,
  AgentConfig,
  LLMOptions,
  ResearchResult,
  ResearchIssue,
  ResearchSolution,
  ResearchUseCase,
  CodeResult,
  CodeExample,
  APIExample,
  IntegrationExample,
  CodePattern,
  StructureResult,
  DocumentSection,
  NavigationItem,
  CombinedAgentResults
} from './types';
