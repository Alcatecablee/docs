/**
 * Documentation Preview Parser
 * Converts AI-generated HTML content into Documentation structure for EditableDocViewer
 * Phase 1: HTML parsing with Cheerio-like DOM parsing
 * Phase 2: Real-time section updates from WebSocket
 */

import type { Documentation, Section, ContentBlock } from '../../shared/doc-editor-types';

/**
 * Parse HTML preview content into Documentation structure
 * Extracts sections, headings, paragraphs, lists, code blocks, and callouts
 */
export function parsePreviewToDocumentation(htmlContent: string, title: string): Documentation | null {
  if (!htmlContent) return null;

  // For browser environment, use DOMParser to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const sections: Section[] = [];
  let sectionCounter = 0;
  
  // Strategy 1: Look for <section> elements (if template uses them)
  const sectionElements = doc.querySelectorAll('section');
  
  if (sectionElements.length > 0) {
    // Parse structured sections
    sectionElements.forEach((sectionEl, index) => {
      const section = parseSectionElement(sectionEl, index);
      if (section) sections.push(section);
    });
  } else {
    // Strategy 2: Split by H2 headings (common doc structure)
    const h2Elements = doc.querySelectorAll('h2');
    
    if (h2Elements.length > 0) {
      h2Elements.forEach((h2, index) => {
        const section = parseSectionFromH2(h2, doc, index);
        if (section) sections.push(section);
      });
    } else {
      // Strategy 3: Fallback - create single section from body content
      const bodyContent = doc.body;
      if (bodyContent && bodyContent.textContent?.trim()) {
        sections.push(parseBodyAsSingleSection(bodyContent));
      }
    }
  }

  // If no sections parsed, return null
  if (sections.length === 0) {
    return null;
  }

  return {
    title: extractTitle(doc) || title || 'Generated Documentation',
    description: extractDescription(doc) || 'AI-generated documentation from multiple sources',
    sections,
  };
}

/**
 * Extract title from HTML document (h1, title tag, or meta)
 */
function extractTitle(doc: Document): string | null {
  const h1 = doc.querySelector('h1');
  if (h1?.textContent?.trim()) return h1.textContent.trim();
  
  const titleTag = doc.querySelector('title');
  if (titleTag?.textContent?.trim()) return titleTag.textContent.trim();
  
  const metaTitle = doc.querySelector('meta[property="og:title"]');
  if (metaTitle?.getAttribute('content')) return metaTitle.getAttribute('content')!;
  
  return null;
}

/**
 * Extract description from HTML document (meta tags or first paragraph)
 */
function extractDescription(doc: Document): string | null {
  const metaDesc = doc.querySelector('meta[name="description"]');
  if (metaDesc?.getAttribute('content')) return metaDesc.getAttribute('content')!;
  
  const ogDesc = doc.querySelector('meta[property="og:description"]');
  if (ogDesc?.getAttribute('content')) return ogDesc.getAttribute('content')!;
  
  const firstP = doc.querySelector('p');
  if (firstP?.textContent?.trim()) return firstP.textContent.trim();
  
  return null;
}

/**
 * Parse a <section> element into Section structure
 */
function parseSectionElement(sectionEl: Element, index: number): Section | null {
  const heading = sectionEl.querySelector('h2, h3');
  const title = heading?.textContent?.trim() || `Section ${index + 1}`;
  
  const contentBlocks: ContentBlock[] = [];
  let blockCounter = 0;
  
  // Recursively extract all content blocks from the section
  extractContentBlocks(sectionEl, contentBlocks);

  if (contentBlocks.length === 0) return null;

  return {
    id: `section-${index}`,
    title,
    icon: detectSectionIcon(title),
    content: contentBlocks,
  };
}

/**
 * Parse section starting from H2 heading
 */
function parseSectionFromH2(h2: Element, doc: Document, index: number): Section | null {
  const title = h2.textContent?.trim() || `Section ${index + 1}`;
  const contentBlocks: ContentBlock[] = [];
  
  // Get all siblings until next H2
  let currentEl: Element | null = h2.nextElementSibling;
  
  while (currentEl && currentEl.tagName !== 'H2') {
    // Recursively extract content blocks from this element
    extractContentBlocks(currentEl, contentBlocks);
    currentEl = currentEl.nextElementSibling;
  }

  if (contentBlocks.length === 0) return null;

  return {
    id: `section-${index}`,
    title,
    icon: detectSectionIcon(title),
    content: contentBlocks,
  };
}

/**
 * Parse entire body as single section (fallback)
 */
function parseBodyAsSingleSection(body: Element): Section {
  const contentBlocks: ContentBlock[] = [];
  
  // Recursively extract all content blocks from body
  extractContentBlocks(body, contentBlocks);

  return {
    id: 'content',
    title: 'Documentation',
    icon: '📝',
    content: contentBlocks.length > 0 ? contentBlocks : [{
      id: 'default',
      type: 'paragraph',
      text: body.textContent?.trim() || 'No content available',
    }],
  };
}

/**
 * Recursively extract content blocks from an element tree
 * This handles nested structures like <div><div><p>...</p></div></div>
 */
function extractContentBlocks(element: Element, blocks: ContentBlock[]): void {
  // Try to parse this element as a content block
  const block = tryParseAsContentBlock(element, blocks.length);
  
  if (block) {
    // This element is a content block, add it
    blocks.push(block);
  } else if (isContainerElement(element)) {
    // This is a container element (div, section, etc.), recurse into children
    Array.from(element.children).forEach((child) => {
      extractContentBlocks(child, blocks);
    });
  }
}

/**
 * Check if element is a container that should be recursed into
 */
function isContainerElement(el: Element): boolean {
  const tagName = el.tagName.toLowerCase();
  const containerTags = ['div', 'section', 'article', 'main', 'aside', 'nav', 'header', 'footer', 'body'];
  return containerTags.includes(tagName);
}

/**
 * Try to parse individual HTML element into ContentBlock
 * Returns null if element is not a content block (e.g., container div)
 */
function tryParseAsContentBlock(el: Element, index: number): ContentBlock | null {
  const tagName = el.tagName.toLowerCase();
  
  // Paragraph
  if (tagName === 'p') {
    const text = el.textContent?.trim();
    if (!text) return null;
    return {
      id: `block-${index}`,
      type: 'paragraph',
      text,
    };
  }
  
  // Headings (H3-H6, H2 is section title)
  if (['h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    const text = el.textContent?.trim();
    if (!text) return null;
    return {
      id: `block-${index}`,
      type: 'heading',
      level: parseInt(tagName.charAt(1)) as 2 | 3 | 4 | 5 | 6,
      text,
    };
  }
  
  // Unordered lists
  if (tagName === 'ul') {
    const items = Array.from(el.querySelectorAll('li'))
      .map(li => li.textContent?.trim())
      .filter(Boolean) as string[];
    if (items.length === 0) return null;
    return {
      id: `block-${index}`,
      type: 'list',
      items,
    };
  }
  
  // Ordered lists
  if (tagName === 'ol') {
    const items = Array.from(el.querySelectorAll('li'))
      .map(li => li.textContent?.trim())
      .filter(Boolean) as string[];
    if (items.length === 0) return null;
    return {
      id: `block-${index}`,
      type: 'ordered-list',
      items,
    };
  }
  
  // Code blocks
  if (tagName === 'pre') {
    const codeEl = el.querySelector('code');
    const code = codeEl ? codeEl.textContent : el.textContent;
    if (!code?.trim()) return null;
    
    // Try to detect language from class name
    const className = codeEl?.className || '';
    const langMatch = className.match(/language-(\w+)/);
    const language = langMatch ? langMatch[1] : 'plaintext';
    
    return {
      id: `block-${index}`,
      type: 'code',
      code: code.trim(),
      language,
    };
  }
  
  // Callouts (look for common callout classes or data attributes)
  if (el.classList.contains('callout') || 
      el.classList.contains('alert') ||
      el.classList.contains('notice') ||
      el.hasAttribute('data-callout')) {
    const text = el.textContent?.trim();
    if (!text) return null;
    
    // Detect callout type from classes
    let calloutType: 'info' | 'warning' | 'error' | 'success' | 'tip' = 'info';
    if (el.classList.contains('warning') || el.classList.contains('warn')) calloutType = 'warning';
    else if (el.classList.contains('error') || el.classList.contains('danger')) calloutType = 'error';
    else if (el.classList.contains('success')) calloutType = 'success';
    else if (el.classList.contains('tip') || el.classList.contains('hint')) calloutType = 'tip';
    
    return {
      id: `block-${index}`,
      type: 'callout',
      calloutType,
      text,
    };
  }
  
  // Images
  if (tagName === 'img') {
    const src = el.getAttribute('src');
    if (!src) return null;
    
    return {
      id: `block-${index}`,
      type: 'image',
      url: src,
      alt: el.getAttribute('alt') || '',
      caption: el.getAttribute('title') || undefined,
    };
  }
  
  // Figures with images
  if (tagName === 'figure') {
    const img = el.querySelector('img');
    const figcaption = el.querySelector('figcaption');
    if (!img) return null;
    
    const src = img.getAttribute('src');
    if (!src) return null;
    
    return {
      id: `block-${index}`,
      type: 'image',
      url: src,
      alt: img.getAttribute('alt') || '',
      caption: figcaption?.textContent?.trim(),
    };
  }
  
  // Skip H1, H2 (already handled), and empty elements
  if (['h1', 'h2'].includes(tagName)) return null;
  if (!el.textContent?.trim()) return null;
  
  // Fallback: treat as paragraph for any other text content
  const text = el.textContent?.trim();
  if (!text) return null;
  
  return {
    id: `block-${index}`,
    type: 'paragraph',
    text,
  };
}

/**
 * Detect appropriate icon for section based on title
 */
function detectSectionIcon(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('start') || lowerTitle.includes('intro')) return '🚀';
  if (lowerTitle.includes('install') || lowerTitle.includes('setup')) return '⚙️';
  if (lowerTitle.includes('api') || lowerTitle.includes('reference')) return '📚';
  if (lowerTitle.includes('example') || lowerTitle.includes('tutorial')) return '💡';
  if (lowerTitle.includes('config') || lowerTitle.includes('setting')) return '⚙️';
  if (lowerTitle.includes('feature')) return '✨';
  if (lowerTitle.includes('guide') || lowerTitle.includes('how')) return '📖';
  if (lowerTitle.includes('troubleshoot') || lowerTitle.includes('error')) return '🔧';
  if (lowerTitle.includes('faq') || lowerTitle.includes('question')) return '❓';
  if (lowerTitle.includes('deploy') || lowerTitle.includes('production')) return '🚢';
  if (lowerTitle.includes('security')) return '🔒';
  if (lowerTitle.includes('performance')) return '⚡';
  
  return '📝';
}

/**
 * Parse real-time section updates from WebSocket
 * TODO Phase 2: Implement real-time section parsing
 */
export function parseRealtimeSection(sectionData: any): Section | null {
  // Placeholder for Phase 2
  return null;
}

/**
 * Convert content blocks from various formats
 * TODO Phase 2: Implement smart content block detection
 */
export function detectContentBlocks(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  
  // Simple paragraph detection for Phase 1
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  paragraphs.forEach((para, index) => {
    blocks.push({
      id: `block-${index}`,
      type: 'paragraph',
      text: para.trim(),
    });
  });

  return blocks;
}
