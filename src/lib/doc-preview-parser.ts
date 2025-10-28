/**
 * Documentation Preview Parser
 * Converts AI-generated content into Documentation structure for EditableDocViewer
 * Phase 1: Basic HTML/text parsing
 * Phase 2: Real-time section updates from WebSocket
 */

import type { Documentation, Section, ContentBlock } from '../../shared/doc-editor-types';

/**
 * Parse HTML preview content into Documentation structure
 * TODO: Replace with real-time parsing from AI generation
 */
export function parsePreviewToDocumentation(htmlContent: string, title: string): Documentation | null {
  if (!htmlContent) return null;

  // For Phase 1: Create a simple mock documentation structure
  // In Phase 2-3, this will parse actual AI-generated sections
  const mockDocumentation: Documentation = {
    title: title || 'Generated Documentation',
    description: 'AI-generated documentation from multiple sources',
    sections: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        icon: '🚀',
        content: [
          {
            id: 'intro-para',
            type: 'paragraph',
            text: 'This documentation is being generated in real-time by analyzing your target website and aggregating information from multiple sources including Stack Overflow, GitHub, YouTube, Reddit, and Dev.to.',
          },
          {
            id: 'preview-note',
            type: 'callout',
            calloutType: 'info',
            text: 'This is a Phase 1 read-only preview. Edit Mode will be enabled in Phase 2.',
          },
        ],
      },
      {
        id: 'live-content',
        title: 'AI-Generated Content',
        icon: '✨',
        content: [
          {
            id: 'ai-content',
            type: 'paragraph',
            text: htmlContent.replace(/<[^>]*>/g, '').substring(0, 500) + '...',
          },
        ],
      },
    ],
  };

  return mockDocumentation;
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
