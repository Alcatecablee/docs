/**
 * Structure Agent
 * Analyzes sitemap, README, docs structure to create optimal documentation outline
 * Uses LLM with context about the product to generate structure
 */

import { BaseAgent } from './base-agent';
import { AgentContext, StructureResult, DocumentSection, NavigationItem } from './types';

export class StructureAgent extends BaseAgent<StructureResult> {
  readonly name = 'Structure Agent';
  protected readonly config = {
    timeout: 45000, // 45 seconds
    retries: 2,
    cacheTTL: 3600, // 1 hour
    enabled: true
  };

  async execute(context: AgentContext): Promise<StructureResult> {
    const startTime = Date.now();
    
    try {
      this.log('Analyzing structure for ' + context.product);
      
      // Use LLM to analyze and create optimal documentation structure
      // This is appropriate use of LLM for strategic/architectural decisions
      const prompt = this.buildStructurePrompt(context);
      
      const response = await this.measure('LLM structure analysis', () =>
        this.callLLM(prompt, {
          temperature: 0.5, // Balanced for creative but organized structure
          maxTokens: 6000,
          jsonMode: true
        })
      );
      
      // Parse the structure results
      const data = this.parseJSON<any>(response);
      
      if (!data) {
        throw new Error('Failed to parse structure results');
      }
      
      const executionTime = Date.now() - startTime;
      this.log(`Structure created with ${data.outline?.length || 0} sections in ${executionTime}ms`);
      
      return {
        agentName: this.name,
        executionTime,
        success: true,
        data: {
          outline: data.outline || this.getDefaultOutline(context),
          navigation: data.navigation || [],
          contentGaps: data.contentGaps || [],
          recommendedSections: data.recommendedSections || [],
          pageCount: data.pageCount || data.outline?.length || 0
        }
      };
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      this.log(`Structure analysis failed: ${error.message}`, 'error');
      
      // Return minimal but valid structure (graceful degradation)
      return {
        agentName: this.name,
        executionTime,
        success: false,
        error: error.message,
        data: {
          outline: this.getDefaultOutline(context),
          navigation: [],
          contentGaps: [],
          recommendedSections: [],
          pageCount: 0
        }
      };
    }
  }

  private buildStructurePrompt(context: AgentContext): string {
    return `You are a documentation architect creating the optimal structure for ${context.product} documentation.

**Your Task**: Analyze the product and create a comprehensive, enterprise-grade documentation outline.

**Product Information**:
- Name: ${context.product}
- URL: ${context.url}
- Type: ${context.productType || 'Software/Service'}
${context.repoUrl ? `- GitHub: ${context.repoUrl}` : ''}

**Analysis Areas**:

1. **Site Structure Analysis**
   - Examine: sitemap.xml, robots.txt, navigation menus
   - Identify: Main sections, subsections, page hierarchy
   - Note: Existing documentation organization patterns
   
2. **Content Inventory**
   - Scan for: /docs, /api, /guides, /tutorials, /help
   - Identify: What content already exists
   - Note: Popular documentation paths and conventions
   
3. **Gap Analysis**
   - Compare: Current structure vs. best practices
   - Identify: Missing essential sections
   - Recommend: Additional sections that should exist
   
4. **Documentation Outline Creation**
   - Design: Logical, progressive learning path
   - Structure: From basics (Quick Start) to advanced (API Reference)
   - Organize: Related topics together
   - Prioritize: Most important sections first

**Standard Documentation Sections** (use as reference):
1. Overview / Introduction
2. Getting Started / Quick Start
3. Installation / Setup
4. Basic Concepts / Core Features
5. Tutorials / How-To Guides
6. API Reference / Technical Documentation
7. Advanced Topics / Best Practices
8. Troubleshooting / FAQ
9. Integration Guides
10. Community / Support

**Output Format** (JSON):
\`\`\`json
{
  "outline": [
    {
      "id": "getting-started",
      "title": "Getting Started",
      "description": "Quick start guide for new users",
      "subsections": [
        "Installation",
        "Basic Setup",
        "First Project"
      ],
      "priority": 1
    },
    {
      "id": "api-reference",
      "title": "API Reference",
      "description": "Complete API documentation",
      "subsections": [
        "Authentication",
        "Endpoints",
        "Rate Limits"
      ],
      "priority": 2
    }
  ],
  "navigation": [
    {
      "label": "Documentation",
      "path": "/docs",
      "children": [
        {
          "label": "Getting Started",
          "path": "/docs/getting-started"
        }
      ]
    }
  ],
  "contentGaps": [
    "Missing troubleshooting section",
    "No integration examples",
    "Limited API documentation"
  ],
  "recommendedSections": [
    "Migration Guide",
    "Security Best Practices",
    "Performance Optimization"
  ],
  "pageCount": 15
}
\`\`\`

**Critical Guidelines**:
- Follow industry-standard documentation patterns (like Stripe, Supabase, Next.js)
- Organize content progressively (beginner → intermediate → advanced)
- Group related topics together
- Use clear, descriptive section titles
- Prioritize sections by importance (priority 1 = most important)
- Include practical sections (tutorials, examples, troubleshooting)
- Consider the user journey (awareness → onboarding → mastery)
- Identify gaps in existing documentation

Provide a comprehensive documentation structure in the JSON format above.`;
  }

  private getDefaultOutline(context: AgentContext) {
    return [
      {
        id: 'introduction',
        title: 'Introduction',
        description: `Overview of ${context.product}`,
        subsections: ['What is it?', 'Key Features', 'Use Cases'],
        priority: 1
      },
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Quick start guide',
        subsections: ['Installation', 'Basic Setup', 'First Steps'],
        priority: 2
      },
      {
        id: 'features',
        title: 'Features',
        description: 'Core features and capabilities',
        subsections: [],
        priority: 3
      }
    ];
  }
}
