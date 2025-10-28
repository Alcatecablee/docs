/**
 * EditableDocViewer Component
 * Phase 2: Block-level editing with rich text, code, and image editing
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { Documentation, Section, ContentBlock } from '../../shared/doc-editor-types';
import { EditableParagraph } from './doc-editor/EditableParagraph';
import { EditableHeading } from './doc-editor/EditableHeading';
import { EditableList } from './doc-editor/EditableList';
import { EditableCodeBlock } from './doc-editor/EditableCodeBlock';
import { EditableCallout } from './doc-editor/EditableCallout';
import { EditableImage } from './doc-editor/EditableImage';

export interface EditableDocViewerProps {
  documentation: Documentation | null;
  isEditing: boolean;
  onEditModeToggle?: () => void;
  onDocumentChange?: (doc: Documentation) => void;
  onBlockUpdate?: (sectionId: string, blockId: string, updates: Partial<ContentBlock>) => void;
  isLoading?: boolean;
}

export function EditableDocViewer({
  documentation,
  isEditing,
  onEditModeToggle,
  onDocumentChange,
  onBlockUpdate,
  isLoading = false,
}: EditableDocViewerProps) {

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
        
        {/* Edit Mode Toggle */}
        <Button
          size="sm"
          variant="outline"
          onClick={onEditModeToggle}
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
              onBlockUpdate={onBlockUpdate}
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
  onBlockUpdate?: (sectionId: string, blockId: string, updates: Partial<ContentBlock>) => void;
}

function SectionRenderer({ section, isEditing, onBlockUpdate }: SectionRendererProps) {
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
            sectionId={section.id}
            isEditing={isEditing}
            onBlockUpdate={onBlockUpdate}
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
  sectionId: string;
  isEditing: boolean;
  onBlockUpdate?: (sectionId: string, blockId: string, updates: Partial<ContentBlock>) => void;
}

function ContentBlockRenderer({ block, sectionId, isEditing, onBlockUpdate }: ContentBlockRendererProps) {
  const handleUpdate = (updates: Partial<ContentBlock>) => {
    if (onBlockUpdate) {
      onBlockUpdate(sectionId, block.id, updates);
    }
  };
  switch (block.type) {
    case 'paragraph':
      return (
        <EditableParagraph
          text={block.text || ''}
          isEditing={isEditing}
          onUpdate={(text) => handleUpdate({ text })}
        />
      );

    case 'heading':
      return (
        <EditableHeading
          text={block.text || ''}
          level={block.level || 3}
          isEditing={isEditing}
          onUpdate={handleUpdate}
        />
      );

    case 'list':
      return (
        <EditableList
          items={block.items || []}
          ordered={false}
          isEditing={isEditing}
          onUpdate={handleUpdate}
        />
      );

    case 'ordered-list':
      return (
        <EditableList
          items={block.items || []}
          ordered={true}
          isEditing={isEditing}
          onUpdate={handleUpdate}
        />
      );

    case 'code':
      return (
        <EditableCodeBlock
          code={block.code || block.text || ''}
          language={block.language || 'javascript'}
          isEditing={isEditing}
          onUpdate={handleUpdate}
        />
      );

    case 'callout':
      return (
        <EditableCallout
          text={block.text || ''}
          calloutType={block.calloutType || 'info'}
          isEditing={isEditing}
          onUpdate={handleUpdate}
        />
      );

    case 'image':
      return (
        <EditableImage
          url={block.url || ''}
          alt={block.alt}
          caption={block.caption}
          isEditing={isEditing}
          onUpdate={handleUpdate}
        />
      );

    default:
      return null;
  }
}
