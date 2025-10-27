/**
 * Documentation Content Parser
 * Converts JSON documentation structure to HTML
 */

export interface Section {
  id: string;
  title: string;
  icon: string;
  content: ContentBlock[];
}

export interface ContentBlock {
  type: string;
  text?: string;
  level?: number;
  items?: string[];
  language?: string;
  code?: string;
  calloutType?: string;
  url?: string;
  alt?: string;
  caption?: string;
}

export class DocumentationParser {
  /**
   * Parse documentation JSON to structured sections
   * FLEXIBLE: Supports any section structure - no enforced sections
   * - Pass custom icons directly: { "icon": "🎨", "title": "Design" }
   * - Or auto-detect from title: { "title": "API Reference" } → 🔌
   * - Supports 1 section or 100+ sections
   */
  static parseSections(content: string | object): Section[] {
    try {
      const data = typeof content === 'string' ? JSON.parse(content) : content;
      
      if (!data.sections || !Array.isArray(data.sections)) {
        return [];
      }

      return data.sections.map((section: any, index: number) => ({
        id: this.generateId(section.title || `section-${index}`),
        title: section.title || `Section ${index + 1}`,
        icon: section.icon || this.getIcon(section.title),
        content: section.content || []
      }));
    } catch (error) {
      console.error('Error parsing documentation sections:', error);
      return [];
    }
  }

  /**
   * Convert sections to HTML content
   */
  static sectionsToHTML(sections: Section[]): string {
    return sections.map(section => {
      const sectionId = section.id;
      const sectionHtml = this.renderContentBlocks(section.content);
      
      return `
<section id="${sectionId}" class="doc-section">
  <h2 id="${sectionId}">
    ${this.escapeHtml(section.title)}
    <a href="#${sectionId}" class="anchor-link">#</a>
  </h2>
  ${sectionHtml}
</section>
      `.trim();
    }).join('\n\n');
  }

  /**
   * Render content blocks to HTML
   */
  private static renderContentBlocks(blocks: ContentBlock[]): string {
    return blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${this.escapeHtml(block.text || '')}</p>`;
          
        case 'heading':
          const level = block.level || 3;
          const headingId = this.generateId(block.text || '');
          return `<h${level} id="${headingId}">${this.escapeHtml(block.text || '')}<a href="#${headingId}" class="anchor-link">#</a></h${level}>`;
          
        case 'list':
          if (Array.isArray(block.items)) {
            const listItems = block.items.map(item => `<li>${this.escapeHtml(item)}</li>`).join('\n');
            return `<ul>\n${listItems}\n</ul>`;
          }
          return '';
          
        case 'ordered-list':
          if (Array.isArray(block.items)) {
            const listItems = block.items.map(item => `<li>${this.escapeHtml(item)}</li>`).join('\n');
            return `<ol>\n${listItems}\n</ol>`;
          }
          return '';
          
        case 'code':
          const language = block.language || 'javascript';
          const code = block.code || block.text || '';
          return `
<div class="code-block-wrapper">
  <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
</div>
          `.trim();
          
        case 'callout':
          const calloutType = block.calloutType || 'info';
          return `
<div class="callout callout-${calloutType}">
  <p>${this.escapeHtml(block.text || '')}</p>
</div>
          `.trim();
          
        case 'image':
          const caption = block.caption ? `<figcaption>${this.escapeHtml(block.caption)}</figcaption>` : '';
          return `
<figure>
  <img src="${this.escapeHtml(block.url || '')}" alt="${this.escapeHtml(block.alt || '')}" loading="lazy">
  ${caption}
</figure>
          `.trim();
          
        default:
          return `<p>${this.escapeHtml(block.text || '')}</p>`;
      }
    }).join('\n\n');
  }

  /**
   * Generate slug ID from text
   */
  private static generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Get emoji icon based on title (keyword matching)
   * Falls back to generic document icon if no match
   * FLEXIBLE: Add your own keywords or use custom icons in JSON
   */
  private static getIcon(text: string): string {
    if (!text) return '📄';
    
    const iconMap: { [key: string]: string } = {
      'getting started': '🚀',
      'quick start': '⚡',
      'installation': '📦',
      'configuration': '⚙️',
      'api': '🔌',
      'reference': '📚',
      'guide': '📖',
      'tutorial': '🎓',
      'examples': '💡',
      'faq': '❓',
      'troubleshooting': '🔧',
      'best practices': '⭐',
      'security': '🔒',
      'authentication': '🔐',
      'deployment': '🚀',
      'features': '✨',
      'pricing': '💰',
      'overview': '👁️',
      'introduction': '👋',
      'concepts': '💭',
      'architecture': '🏗️',
      'performance': '⚡',
      'testing': '🧪',
      'changelog': '📝',
      'migration': '🔄',
      'plugins': '🔌',
      'integrations': '🔗',
      'community': '👥',
      'support': '💬',
      'resources': '📚'
    };

    const lowerText = text.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerText.includes(key)) {
        return icon;
      }
    }
    
    return '📄';
  }

  /**
   * Escape HTML special characters
   */
  private static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
