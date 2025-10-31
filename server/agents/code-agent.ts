/**
 * Code Agent
 * Finds real, working code examples from GitHub, official repos, documentation
 * Uses REAL search and LLM to extract code examples
 */

import { BaseAgent } from './base-agent';
import { AgentContext, CodeResult, CodeExample, APIExample, IntegrationExample, CodePattern } from './types';
import { searchService } from '../search-service';

export class CodeAgent extends BaseAgent<CodeResult> {
  readonly name = 'Code Agent';
  protected readonly config = {
    timeout: 60000, // 60 seconds (increased for real API calls + LLM processing)
    retries: 2,
    cacheTTL: 3600, // 1 hour
    enabled: true
  };

  async execute(context: AgentContext): Promise<CodeResult> {
    const startTime = Date.now();
    
    try {
      this.log('Finding real code examples for ' + context.product);
      
      // Get real search results for code examples
      const searchResults = await this.measure('Search for code examples', () =>
        searchService.performComprehensiveResearch(
          context.product,
          context.url,
          'medium',
          0,
          false, // No YouTube for code search
          false
        )
      );
      
      // Use LLM to analyze the search results and extract structured code examples
      const prompt = this.buildCodeAnalysisPrompt(context, searchResults);
      
      const response = await this.measure('LLM code analysis', () =>
        this.callLLM(prompt, {
          temperature: 0.3, // Lower temperature for accurate code
          maxTokens: 8000,
          jsonMode: true
        })
      );
      
      // Parse the code results
      const data = this.parseJSON<any>(response);
      
      if (!data) {
        throw new Error('Failed to parse code results');
      }
      
      const executionTime = Date.now() - startTime;
      this.log(`Code search completed with ${data.quickStart?.length || 0} examples in ${executionTime}ms`);
      
      return {
        agentName: this.name,
        executionTime,
        success: true,
        data: {
          quickStart: data.quickStart || [],
          apiExamples: data.apiExamples || [],
          integrationExamples: data.integrationExamples || [],
          commonPatterns: data.commonPatterns || [],
          officialRepo: context.repoUrl || data.officialRepo
        }
      };
      
    } catch (error: any) {
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

  private buildCodeAnalysisPrompt(context: AgentContext, searchResults: any): string {
    const stackOverflowCode = searchResults.stackOverflowAnswers
      .slice(0, 5)
      .map(so => `Q: ${so.question}\nA: ${so.answer.substring(0, 800)}`)
      .join('\n\n---\n\n');
    
    const githubInfo = searchResults.gitHubIssues
      .slice(0, 5)
      .map(gh => `Issue: ${gh.title}\nDescription: ${gh.description.substring(0, 500)}`)
      .join('\n\n---\n\n');
    
    const language = context.language || 'JavaScript';
    
    return `You are analyzing real search results to extract code examples for ${context.product}.

**Product**: ${context.product}
**URL**: ${context.url}
**Primary Language**: ${language}
${context.repoUrl ? `**GitHub**: ${context.repoUrl}` : ''}

**Real Stack Overflow Data**:
${stackOverflowCode || 'No Stack Overflow data available'}

**Real GitHub Issues**:
${githubInfo || 'No GitHub data available'}

**Your Task**: Extract and structure real code examples from the above data.

Output JSON format:
\`\`\`json
{
  "quickStart": [
    {
      "language": "javascript",
      "code": "// Real code from search results",
      "description": "Basic setup example",
      "source": "Stack Overflow",
      "stars": 42
    }
  ],
  "apiExamples": [
    {
      "method": "authenticate",
      "endpoint": "/api/auth",
      "example": "const result = await api.auth()",
      "explanation": "How to authenticate",
      "language": "javascript"
    }
  ],
  "integrationExamples": [
    {
      "framework": "React",
      "code": "// Integration code",
      "description": "React integration",
      "source": "GitHub"
    }
  ],
  "commonPatterns": [
    {
      "pattern": "Error handling",
      "usage": "Wrap API calls in try-catch",
      "example": "try { await api.call() } catch(e) {}",
      "frequency": 85
    }
  ],
  "officialRepo": "https://github.com/..."
}
\`\`\`

Extract ONLY real code from the search results above. Do not invent examples.`;
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
