/**
 * Code Agent
 * Finds real, working code examples from GitHub, official repos, documentation
 */

import { BaseAgent } from './base-agent';
import { AgentContext, CodeResult, codeResultSchema } from './types';

export class CodeAgent extends BaseAgent<CodeResult> {
  readonly name = 'Code Agent';
  protected readonly config = {
    timeout: 30000, // 30 seconds
    retries: 2,
    cacheTTL: 3600, // 1 hour
    enabled: true
  };

  async execute(context: AgentContext): Promise<CodeResult> {
    const startTime = Date.now();
    
    try {
      this.log('Finding code examples for ' + context.product);
      
      // Generate code search prompt
      const prompt = this.buildCodePrompt(context);
      
      // Call LLM to find and analyze code examples
      const response = await this.measure('LLM code search', () =>
        this.callLLM(prompt, {
          temperature: 0.3, // Lower temperature for accurate code
          maxTokens: 6000
        })
      );
      
      // Parse the code results
      const data = this.parseJSON<any>(response);
      
      if (!data) {
        throw new Error('Failed to parse code results');
      }
      
      // Validate the output
      const validation = await this.validateOutput(data, codeResultSchema);
      
      if (!validation.valid) {
        this.log(`Validation warning: ${validation.error}`, 'warn');
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        agentName: this.name,
        executionTime,
        success: true,
        data: validation.data || data
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.log(`Code search failed: ${error.message}`, 'error');
      
      // Return empty but valid result (graceful degradation)
      return {
        agentName: this.name,
        executionTime,
        success: false,
        error: error.message,
        data: {
          quickStart: [],
          apiExamples: [],
          integrationExamples: [],
          commonPatterns: [],
          officialRepo: context.repoUrl
        }
      };
    }
  }

  private buildCodePrompt(context: AgentContext): string {
    const language = context.language || 'JavaScript';
    
    return `You are a code specialist finding real, working examples for ${context.product}.

**Your Task**: Find authentic code examples from GitHub, official documentation, and community resources.

**Product Information**:
- Name: ${context.product}
- URL: ${context.url}
${context.repoUrl ? `- GitHub: ${context.repoUrl}` : ''}
- Primary Language: ${language}

**Code Search Areas**:

1. **Quick Start Examples**
   - Search in: Official README, Getting Started guides
   - Find: Minimal working examples (hello world, basic setup)
   - Requirements: Must be complete, runnable code
   - Prefer: Official examples over community examples
   
2. **API Usage Examples**
   - Search in: API documentation, code samples, tests
   - Find: Common API methods and their usage
   - Requirements: Real method signatures, actual parameters
   - Include: Input/output examples, error handling
   
3. **Integration Examples**
   - Search for: "${context.product} + React", "${context.product} + Node.js", etc.
   - Find: How it integrates with popular frameworks
   - Requirements: Complete integration patterns
   - Prefer: Officially supported integrations
   
4. **Common Code Patterns**
   - Analyze: Frequently used patterns in examples
   - Identify: Best practices, idioms, conventions
   - Extract: Reusable patterns with high frequency
   - Note: Anti-patterns to avoid

**Output Format** (JSON):
\`\`\`json
{
  "quickStart": [
    {
      "language": "javascript",
      "code": "import { createClient } from '${context.product}'\\nconst client = createClient(...)\\n...",
      "description": "Basic setup and initialization",
      "source": "Official README.md",
      "stars": 12500
    }
  ],
  "apiExamples": [
    {
      "method": "authenticate",
      "endpoint": "/auth/login",
      "example": "await client.auth.signIn({ email, password })",
      "explanation": "Authenticates user with email and password",
      "language": "javascript"
    }
  ],
  "integrationExamples": [
    {
      "framework": "React",
      "code": "const MyComponent = () => {\\n  const [data, setData] = useState()\\n  ...",
      "description": "React hooks integration pattern",
      "source": "https://github.com/..."
    }
  ],
  "commonPatterns": [
    {
      "pattern": "Error handling with try-catch",
      "usage": "Wrap all async calls in try-catch blocks",
      "example": "try { await client.query() } catch (error) { ... }",
      "frequency": 87
    }
  ],
  "officialRepo": "https://github.com/${context.product}/${context.product}"
}
\`\`\`

**Critical Guidelines**:
- Extract REAL code from actual repositories/documentation
- Ensure code is syntactically correct and runnable
- Prefer official examples (README, docs, examples/ folder)
- Include error handling in examples
- Use latest API versions (check package.json, changelog)
- Validate code snippets aren't deprecated
- Include imports/dependencies
- Comment complex code sections

Provide comprehensive code examples in the JSON format above.`;
  }
}
