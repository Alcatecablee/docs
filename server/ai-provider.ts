import fetch from 'node-fetch';
import { withTimeout, retryWithFallback } from './utils/retry-with-fallback';
import { withCircuitBreaker } from './utils/circuit-breaker';
import { rateLimiter } from './rate-limiter';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: 'google' | 'groq' | 'hyperbolic' | 'openrouter' | 'openai';
  model: string;
}

interface AIProviderConfig {
  googleApiKey?: string;
  openrouterApiKey?: string;
  hyperbolicApiKey?: string;
  openaiApiKey?: string;
  groqApiKey?: string;
  providerOrder?: string[]; // e.g. ['google','groq','hyperbolic','openrouter','openai']
}

export class AIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  private async withRateLimit<T>(
    provider: string,
    estimatedTokens: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const canProceed = await rateLimiter.waitForToken(provider, estimatedTokens, 5000);
    
    if (!canProceed) {
      throw new Error(`Rate limit exceeded for ${provider}, trying next provider`);
    }
    
    return fn();
  }

  async generateCompletion(
    messages: AIMessage[],
    options: {
      jsonMode?: boolean;
      maxRetries?: number;
      timeoutMs?: number;
    } = {}
  ): Promise<AIResponse> {
    const { jsonMode = false, maxRetries = 3, timeoutMs = 60000 } = options;

    const estimatedTokens = Math.ceil(messages.reduce((sum, msg) => sum + msg.content.length, 0) / 4);

    // Build provider order from config with free-first priority
    const order = (this.config.providerOrder && this.config.providerOrder.length > 0)
      ? this.config.providerOrder
      : ['google', 'groq', 'hyperbolic', 'openrouter', 'openai'];

    const providers: Array<() => Promise<AIResponse>> = [];

    for (const p of order) {
      if (p === 'google' && this.config.googleApiKey) {
        providers.push(() => 
          this.withRateLimit('google', estimatedTokens, () =>
            withCircuitBreaker(
              'ai-provider-google',
              () => withTimeout(this.callGoogle(messages, jsonMode), timeoutMs, 'google timed out')
            )
          )
        );
      }
      if (p === 'groq' && this.config.groqApiKey) {
        providers.push(() => 
          this.withRateLimit('groq', estimatedTokens, () =>
            withCircuitBreaker(
              'ai-provider-groq',
              () => withTimeout(this.callGroq(messages, jsonMode), timeoutMs, 'groq timed out')
            )
          )
        );
      }
      if (p === 'hyperbolic' && this.config.hyperbolicApiKey) {
        providers.push(() => 
          this.withRateLimit('hyperbolic', estimatedTokens, () =>
            withCircuitBreaker(
              'ai-provider-hyperbolic',
              () => withTimeout(this.callHyperbolic(messages, jsonMode), timeoutMs, 'hyperbolic timed out')
            )
          )
        );
      }
      if (p === 'openrouter' && this.config.openrouterApiKey) {
        providers.push(() => 
          this.withRateLimit('openrouter', estimatedTokens, () =>
            withCircuitBreaker(
              'ai-provider-openrouter',
              () => withTimeout(this.callOpenRouter(messages, jsonMode), timeoutMs, 'openrouter timed out')
            )
          )
        );
      }
      if (p === 'openai' && this.config.openaiApiKey) {
        providers.push(() => 
          this.withRateLimit('openai', estimatedTokens, () =>
            withCircuitBreaker(
              'ai-provider-openai',
              () => withTimeout(this.callOpenAI(messages, jsonMode), timeoutMs, 'openai timed out')
            )
          )
        );
      }
    }

    if (providers.length === 0) {
      throw new Error('No AI providers configured. Set at least one API key: GOOGLE_API_KEY, GROQ_API_KEY, HYPERBOLIC_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY');
    }

    const result = await retryWithFallback<AIResponse>(providers, {
      maxRetries,
      timeout: timeoutMs,
      cacheResults: false,
    });

    return result.data;
  }

  private async callGoogle(messages: AIMessage[], jsonMode: boolean): Promise<AIResponse> {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.googleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-exp',
        messages,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google AI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      provider: 'google',
      model: 'gemini-2.0-flash-exp',
    };
  }

  private async callOpenRouter(messages: AIMessage[], jsonMode: boolean): Promise<AIResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://viberdoc.com',
        'X-Title': 'ViberDoc',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-70b-instruct:free',
        messages,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.1-70b-instruct:free',
    };
  }

  private async callHyperbolic(messages: AIMessage[], jsonMode: boolean): Promise<AIResponse> {
    const response = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.hyperbolicApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
        messages,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hyperbolic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      provider: 'hyperbolic',
      model: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
    };
  }

  private async callOpenAI(messages: AIMessage[], jsonMode: boolean): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      provider: 'openai',
      model: 'gpt-5',
    };
  }

  private async callGroq(messages: AIMessage[], jsonMode: boolean): Promise<AIResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
    };
  }

  async parseJSONWithRetry(content: string, retryPrompt: string, maxRetries: number = 3): Promise<any> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.generateCompletion(
          [
            { role: 'system', content: 'You are a JSON formatting expert. Fix the provided content to be valid JSON. Return ONLY valid JSON, no markdown formatting or explanations.' },
            { role: 'user', content: `Fix this JSON:\n\n${content}\n\n${retryPrompt}` }
          ],
          { jsonMode: true }
        );

        const parsed = JSON.parse(response.content);
        console.log(`✅ JSON parsed successfully using ${response.provider} (attempt ${i + 1})`);
        return parsed;
      } catch (error) {
        lastError = error as Error;
        console.log(`Retry ${i + 1} failed:`, (error as Error).message);
      }
    }

    throw lastError || new Error('Failed to parse JSON after retries');
  }
}

export function createAIProvider(customProviderOrder?: string[]): AIProvider {
  const envProviderOrder = (process.env.AI_PROVIDER_ORDER || '').split(',').map(s => s.trim()).filter(Boolean);
  
  return new AIProvider({
    googleApiKey: process.env.GOOGLE_API_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    hyperbolicApiKey: process.env.HYPERBOLIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    providerOrder: customProviderOrder || envProviderOrder,
  });
}
