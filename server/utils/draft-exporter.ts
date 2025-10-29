/**
 * Draft Exporter Utility
 * Converts draft sections (structured JSON) into export-ready format
 */

import type { Section, ContentBlock } from '../../shared/doc-editor-types';

export interface DraftExportData {
  title: string;
  description?: string;
  sections: Section[];
  metadata?: any;
}

/**
 * Converts draft sections to the format expected by export endpoints
 */
export function convertDraftToExportFormat(draft: {
  title: string;
  description?: string | null;
  sections: any;
  metadata?: any;
}): DraftExportData {
  return {
    title: draft.title,
    description: draft.description || undefined,
    sections: Array.isArray(draft.sections) ? draft.sections : [],
    metadata: draft.metadata || {},
  };
}

/**
 * Converts draft content blocks to HTML
 */
export function draftContentBlocksToHTML(blocks: ContentBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
        return `<p>${escapeHtml(block.text || '')}</p>`;
        
      case 'heading':
        const level = block.level || 3;
        const headingId = generateId(block.text || '');
        return `<h${level} id="${headingId}">${escapeHtml(block.text || '')}<a href="#${headingId}" class="anchor-link">#</a></h${level}>`;
        
      case 'list':
        if (Array.isArray(block.items)) {
          const tag = block.ordered ? 'ol' : 'ul';
          const listItems = block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('\n');
          return `<${tag}>\n${listItems}\n</${tag}>`;
        }
        return '';
        
      case 'code':
        const language = block.language || 'javascript';
        const code = block.code || block.text || '';
        return `
<div class="code-block-wrapper">
  <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
</div>
        `.trim();
        
      case 'callout':
        const calloutType = block.calloutType || 'info';
        return `
<div class="callout callout-${calloutType}">
  <p>${escapeHtml(block.text || '')}</p>
</div>
        `.trim();
        
      case 'image':
        const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : '';
        return `
<figure>
  <img src="${escapeHtml(block.url || '')}" alt="${escapeHtml(block.alt || '')}" loading="lazy">
  ${caption}
</figure>
        `.trim();
        
      default:
        return `<p>${escapeHtml(block.text || '')}</p>`;
    }
  }).join('\n\n');
}

/**
 * Converts draft sections to HTML
 */
export function draftSectionsToHTML(sections: Section[]): string {
  return sections.map(section => {
    const sectionId = section.id;
    const sectionHtml = draftContentBlocksToHTML(section.content);
    
    return `
<section id="${sectionId}" class="doc-section">
  <h2 id="${sectionId}">
    ${section.icon ? `<span class="section-icon">${section.icon}</span> ` : ''}
    ${escapeHtml(section.title)}
    <a href="#${sectionId}" class="anchor-link">#</a>
  </h2>
  ${sectionHtml}
</section>
    `.trim();
  }).join('\n\n');
}

/**
 * Converts draft sections to Markdown
 */
export function draftSectionsToMarkdown(sections: Section[]): string {
  return sections.map(section => {
    let markdown = `## ${section.icon ? `${section.icon} ` : ''}${section.title}\n\n`;
    
    section.content.forEach(block => {
      switch (block.type) {
        case 'paragraph':
          markdown += `${block.text || ''}\n\n`;
          break;
          
        case 'heading':
          const level = '#'.repeat((block.level || 3) + 1); // +1 because section is h2
          markdown += `${level} ${block.text || ''}\n\n`;
          break;
          
        case 'list':
          if (Array.isArray(block.items)) {
            block.items.forEach((item, idx) => {
              const prefix = block.ordered ? `${idx + 1}. ` : '- ';
              markdown += `${prefix}${item}\n`;
            });
            markdown += '\n';
          }
          break;
          
        case 'code':
          const language = block.language || 'javascript';
          const code = block.code || block.text || '';
          markdown += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
          break;
          
        case 'callout':
          markdown += `> **${(block.calloutType || 'info').toUpperCase()}**: ${block.text || ''}\n\n`;
          break;
          
        case 'image':
          const altText = block.alt || '';
          const caption = block.caption ? `\n*${block.caption}*` : '';
          markdown += `![${altText}](${block.url || ''})${caption}\n\n`;
          break;
      }
    });
    
    return markdown;
  }).join('\n---\n\n');
}

// Helper functions
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
