/**
 * Base Agent Class
 * All specialist agents inherit from this class
 */

import { AgentContext, AgentResult, AgentConfig, LLMOptions } from './types';
import { createAIProvider, AIProvider, AIMessage } from '../ai-provider';
import { z } from 'zod';

export abstract class BaseAgent<T extends AgentResult> {
  abstract readonly name: string;
  protected abstract readonly config: AgentConfig;
  protected aiProvider: AIProvider;

  constructor() {
    // Create AI provider with free-first routing
    this.aiProvider = createAIProvider(['google', 'together', 'openrouter', 'groq', 'hyperbolic', 'deepseek', 'openai']);
  }

  /**
   * Main execution method - must be implemented by each agent
   */
  abstract execute(context: AgentContext): Promise<T>;

  /**
   * Call LLM with automatic provider fallback and retry logic
   */
  protected async callLLM(
    prompt: string,
    options: LLMOptions = {}
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log(`🧠 ${this.name}: Calling LLM...`);
      
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: prompt
        }
      ];
      
      const response = await this.aiProvider.generateCompletion(messages, {
        jsonMode: options.jsonMode ?? false,
        maxRetries: 3,
        timeoutMs: options.timeout ?? this.config.timeout
      });

      const executionTime = Date.now() - startTime;
      console.log(`✅ ${this.name}: LLM call completed in ${executionTime}ms via ${response.provider}`);
      
      return response.content;
    } catch (error: any) {
      console.error(`❌ ${this.name}: LLM call failed:`, error);
      throw new Error(`${this.name} LLM call failed: ${error.message}`);
    }
  }

  /**
   * Validate agent output against a Zod schema
   */
  protected async validateOutput<S>(
    output: unknown,
    schema: z.ZodSchema<S>
  ): Promise<{ valid: boolean; data?: S; error?: string }> {
    try {
      const parsed = schema.parse(output);
      return { valid: true, data: parsed };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        console.error(`❌ ${this.name}: Validation failed:`, errorMessage);
        return { valid: false, error: errorMessage };
      }
      return { valid: false, error: 'Unknown validation error' };
    }
  }

  /**
   * Execute agent with timeout protection
   */
  async executeWithTimeout(context: AgentContext): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${this.name} timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });

    try {
      const result = await Promise.race([
        this.execute(context),
        timeoutPromise
      ]);
      return result;
    } catch (error) {
      console.error(`❌ ${this.name}: Execution failed:`, error);
      throw error;
    }
  }

  /**
   * Parse JSON from LLM response with error handling
   */
  protected parseJSON<T>(response: string): T | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/```\n([\s\S]*?)\n```/);
      
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      return JSON.parse(jsonString.trim()) as T;
    } catch (error) {
      console.error(`❌ ${this.name}: JSON parsing failed:`, error);
      console.error('Response:', response.substring(0, 500));
      return null;
    }
  }

  /**
   * Extract product name from URL
   */
  protected extractProductName(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const parts = domain.split('.');
      
      // Get the main domain name (e.g., "supabase" from "supabase.com")
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {
      return 'Product';
    }
  }

  /**
   * Log agent progress
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const prefix = {
      info: '📝',
      warn: '⚠️',
      error: '❌'
    }[level];
    
    console.log(`${prefix} ${this.name}: ${message}`);
  }

  /**
   * Measure execution time
   */
  protected async measure<R>(
    operation: string,
    fn: () => Promise<R>
  ): Promise<R> {
    const start = Date.now();
    this.log(`Starting ${operation}...`);
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.log(`✅ ${operation} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.log(`❌ ${operation} failed after ${duration}ms: ${error.message}`, 'error');
      throw error;
    }
  }
}
