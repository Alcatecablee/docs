/**
 * Shared types for the Agent System
 */

import { z } from 'zod';

// Base agent context passed to all agents
export interface AgentContext {
  url: string;
  product: string;
  productType?: string;
  repoUrl?: string;
  language?: string;
  sessionId: string;
  userPlan: string;
}

// Base result structure all agents must return
export interface AgentResult {
  agentName: string;
  executionTime: number;
  success: boolean;
  error?: string;
  data: unknown;
}

// Research Agent Results
export interface ResearchIssue {
  title: string;
  url: string;
  votes: number;
  solution?: string;
  source: 'stackoverflow' | 'github' | 'reddit' | 'forum';
}

export interface ResearchSolution {
  approach: string;
  code?: string;
  popularity: number;
  source: string;
}

export interface ResearchUseCase {
  scenario: string;
  description: string;
  source: string;
  url?: string;
}

export interface ResearchResult extends AgentResult {
  data: {
    issues: ResearchIssue[];
    solutions: ResearchSolution[];
    useCases: ResearchUseCase[];
    communityInsights: {
      sentiment: 'positive' | 'neutral' | 'negative';
      popularityTrend: 'rising' | 'stable' | 'declining';
      commonPainPoints: string[];
    };
    sources: string[];
  };
}

// Code Agent Results
export interface CodeExample {
  language: string;
  code: string;
  description: string;
  source: string;
  stars?: number;
}

export interface APIExample {
  method: string;
  endpoint?: string;
  example: string;
  explanation: string;
  language: string;
}

export interface IntegrationExample {
  framework: string;
  code: string;
  description: string;
  source: string;
}

export interface CodePattern {
  pattern: string;
  usage: string;
  example: string;
  frequency: number;
}

export interface CodeResult extends AgentResult {
  data: {
    quickStart: CodeExample[];
    apiExamples: APIExample[];
    integrationExamples: IntegrationExample[];
    commonPatterns: CodePattern[];
    officialRepo?: string;
  };
}

// Structure Agent Results
export interface DocumentSection {
  id: string;
  title: string;
  description?: string;
  subsections?: string[];
  priority: number;
}

export interface NavigationItem {
  label: string;
  path: string;
  children?: NavigationItem[];
}

export interface StructureResult extends AgentResult {
  data: {
    outline: DocumentSection[];
    navigation: NavigationItem[];
    contentGaps: string[];
    recommendedSections: string[];
    pageCount: number;
  };
}

// Combined results from all agents
export interface CombinedAgentResults {
  research: ResearchResult;
  code: CodeResult;
  structure: StructureResult;
  critic?: CriticResult;
  executionTime: number;
  status: 'success' | 'partial' | 'failed';
  failedAgents?: string[];
}

// Critic Agent Types
export interface QualityIssue {
  severity: 'high' | 'medium' | 'low';
  category: 'completeness' | 'accuracy' | 'clarity' | 'depth';
  description: string;
  affectedSection: string;
}

export interface CriticResult extends AgentResult {
  data: {
    qualityScore: number; // 0-100
    issues: QualityIssue[];
    suggestions: string[];
    missingContent: string[];
    strengths: string[];
    needsRefinement: boolean;
  };
}

// LLM call options
export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  preferredProviders?: string[];
  jsonMode?: boolean;
}

// Agent configuration
export interface AgentConfig {
  timeout: number; // milliseconds
  retries: number;
  cacheTTL: number; // seconds
  enabled: boolean;
}

// Validation schemas
export const researchResultSchema = z.object({
  issues: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    votes: z.number(),
    solution: z.string().optional(),
    source: z.enum(['stackoverflow', 'github', 'reddit', 'forum'])
  })),
  solutions: z.array(z.object({
    approach: z.string(),
    code: z.string().optional(),
    popularity: z.number(),
    source: z.string()
  })),
  useCases: z.array(z.object({
    scenario: z.string(),
    description: z.string(),
    source: z.string(),
    url: z.string().url().optional()
  })),
  communityInsights: z.object({
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    popularityTrend: z.enum(['rising', 'stable', 'declining']),
    commonPainPoints: z.array(z.string())
  }),
  sources: z.array(z.string())
});

export const codeResultSchema = z.object({
  quickStart: z.array(z.object({
    language: z.string(),
    code: z.string(),
    description: z.string(),
    source: z.string(),
    stars: z.number().optional()
  })),
  apiExamples: z.array(z.object({
    method: z.string(),
    endpoint: z.string().optional(),
    example: z.string(),
    explanation: z.string(),
    language: z.string()
  })),
  integrationExamples: z.array(z.object({
    framework: z.string(),
    code: z.string(),
    description: z.string(),
    source: z.string()
  })),
  commonPatterns: z.array(z.object({
    pattern: z.string(),
    usage: z.string(),
    example: z.string(),
    frequency: z.number()
  })),
  officialRepo: z.string().url().optional()
});

export const structureResultSchema = z.object({
  outline: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    subsections: z.array(z.string()).optional(),
    priority: z.number()
  })),
  navigation: z.array(z.any()), // Recursive type, validated separately
  contentGaps: z.array(z.string()),
  recommendedSections: z.array(z.string()),
  pageCount: z.number()
});
