/**
 * EditableDocViewer Component
 * Phase 1: Read-only preview with proper formatting
 * Future: Inline editing, drag-and-drop, block management
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { Documentation, Section, ContentBlock } from '../../shared/doc-editor-types';

export interface EditableDocViewerProps {
  documentation: Documentation | null;
  isEditing: boolean;
  onEditModeToggle?: () => void;
  onDocumentChange?: (doc: Documentation) => void;
  isLoading?: boolean;
}

export function EditableDocViewer({
  documentation,
  isEditing,
  onEditModeToggle,
  onDocumentChange,
  isLoading = false,
}: EditableDocViewerProps) {
  
  // TODO Phase 2: Add syntax highlighting with Prism.js or similar

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <ArrowPathIcon className="h-8 w-8 text-[rgb(102,255,228)] animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!documentation || documentation.sections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">No documentation generated yet</p>
          <p className="text-xs text-gray-400">Preview will appear here as AI generates content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Editor Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-gray-900">Documentation Preview</h2>
          <Badge variant={isEditing ? "default" : "secondary"} className="text-xs">
            {isEditing ? (
              <><PencilIcon className="h-3 w-3 mr-1 inline" />Edit Mode</>
            ) : (
              <><EyeIcon className="h-3 w-3 mr-1 inline" />Preview</>
            )}
          </Badge>
        </div>
        
        {/* Edit Mode Toggle (Phase 2) */}
        <Button
          size="sm"
          variant="outline"
          onClick={onEditModeToggle}
          disabled={true} // Phase 1: Disabled until Phase 2
          className="text-xs"
        >
          {isEditing ? 'Exit Edit Mode' : 'Edit Documentation'}
        </Button>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <article className="max-w-4xl mx-auto space-y-8">
          {/* Document Header */}
          <header className="space-y-2 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {documentation.title}
            </h1>
            {documentation.description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {documentation.description}
              </p>
            )}
          </header>

          {/* Sections */}
          {documentation.sections.map((section, index) => (
            <SectionRenderer
              key={section.id || index}
              section={section}
              isEditing={isEditing}
            />
          ))}
        </article>
      </div>
    </div>
  );
}

// ========================================
// SECTION RENDERER
// ========================================

interface SectionRendererProps {
  section: Section;
  isEditing: boolean;
}

function SectionRenderer({ section, isEditing }: SectionRendererProps) {
  return (
    <section className="space-y-4 scroll-mt-20" id={section.id}>
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-300">
        <span className="text-2xl">{section.icon}</span>
        <h2 className="text-2xl font-bold text-gray-900">
          {section.title}
        </h2>
      </div>

      {/* Section Content Blocks */}
      <div className="space-y-4 pl-2">
        {section.content.map((block, index) => (
          <ContentBlockRenderer
            key={block.id || index}
            block={block}
            isEditing={isEditing}
          />
        ))}
      </div>
    </section>
  );
}

// ========================================
// CONTENT BLOCK RENDERER
// ========================================

interface ContentBlockRendererProps {
  block: ContentBlock;
  isEditing: boolean;
}

function ContentBlockRenderer({ block, isEditing }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-gray-700 leading-relaxed">
          {block.text}
        </p>
      );

    case 'heading':
      const HeadingTag = `h${block.level || 3}` as keyof JSX.IntrinsicElements;
      const headingClasses = {
        2: 'text-2xl font-bold text-gray-900 mt-6 mb-3',
        3: 'text-xl font-bold text-gray-900 mt-5 mb-2',
        4: 'text-lg font-semibold text-gray-900 mt-4 mb-2',
        5: 'text-base font-semibold text-gray-900 mt-3 mb-1',
        6: 'text-sm font-semibold text-gray-900 mt-2 mb-1',
      };
      return (
        <HeadingTag className={headingClasses[block.level || 3]}>
          {block.text}
        </HeadingTag>
      );

    case 'list':
      return (
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          {block.items?.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );

    case 'ordered-list':
      return (
        <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4">
          {block.items?.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ol>
      );

    case 'code':
      return (
        <div className="code-block-wrapper relative group">
          <div className="absolute top-2 right-2 z-10">
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {block.language || 'code'}
            </span>
          </div>
          <pre className="bg-gray-900 rounded-lg overflow-x-auto">
            <code className={`language-${block.language || 'javascript'} text-sm`}>
              {block.code || block.text}
            </code>
          </pre>
        </div>
      );

    case 'callout':
      const calloutStyles = {
        info: 'bg-blue-50 border-blue-200 text-blue-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        tip: 'bg-purple-50 border-purple-200 text-purple-900',
      };
      const calloutIcons = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        success: '✅',
        tip: '💡',
      };
      const calloutType = block.calloutType || 'info';
      return (
        <div className={`callout p-4 rounded-lg border-l-4 ${calloutStyles[calloutType]}`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">{calloutIcons[calloutType]}</span>
            <p className="text-sm leading-relaxed">{block.text}</p>
          </div>
        </div>
      );

    case 'image':
      return (
        <figure className="my-6">
          <img
            src={block.url}
            alt={block.alt || ''}
            className="rounded-lg border border-gray-200 w-full"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="text-sm text-gray-600 text-center mt-2 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}
