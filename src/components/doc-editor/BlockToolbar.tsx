import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  PlusCircleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import type { ContentBlock } from '../../../shared/doc-editor-types';

interface BlockToolbarProps {
  sectionId: string;
  insertAfterBlockId?: string;
  onAddBlock: (sectionId: string, block: ContentBlock, insertAfterBlockId?: string) => void;
}

type BlockType = 'paragraph' | 'heading' | 'code' | 'list' | 'callout' | 'image';

export function BlockToolbar({ sectionId, insertAfterBlockId, onAddBlock }: BlockToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);

  const createBlock = (type: BlockType): ContentBlock => {
    const baseId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    switch (type) {
      case 'paragraph':
        return {
          id: baseId,
          type: 'paragraph',
          text: 'New paragraph. Click to edit...',
        };
      
      case 'heading':
        return {
          id: baseId,
          type: 'heading',
          level: 3,
          text: 'New Heading',
        };
      
      case 'code':
        return {
          id: baseId,
          type: 'code',
          language: 'javascript',
          code: '// Write your code here',
        };
      
      case 'list':
        return {
          id: baseId,
          type: 'list',
          ordered: false,
          items: ['List item 1', 'List item 2'],
        };
      
      case 'callout':
        return {
          id: baseId,
          type: 'callout',
          calloutType: 'info',
          text: 'This is an information callout. Edit the text...',
        };
      
      case 'image':
        return {
          id: baseId,
          type: 'image',
          url: 'https://via.placeholder.com/600x300',
          alt: 'Placeholder image',
          caption: 'Add your image caption here',
        };
      
      default:
        return {
          id: baseId,
          type: 'paragraph',
          text: 'New content block',
        };
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createBlock(type);
    onAddBlock(sectionId, newBlock, insertAfterBlockId);
    setShowMenu(false);
  };

  return (
    <div className="relative group">
      {/* Add Block Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Add content block"
      >
        <PlusCircleIcon className="h-5 w-5" />
        <span>Add Block</span>
      </button>

      {/* Block Type Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleAddBlock('paragraph')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
              >
                <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Paragraph</div>
                  <div className="text-xs text-gray-500">Add text content</div>
                </div>
              </button>

              <button
                onClick={() => handleAddBlock('heading')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
              >
                <Bars3BottomLeftIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Heading</div>
                  <div className="text-xs text-gray-500">Section heading</div>
                </div>
              </button>

              <button
                onClick={() => handleAddBlock('list')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
              >
                <ListBulletIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">List</div>
                  <div className="text-xs text-gray-500">Bullet or numbered list</div>
                </div>
              </button>

              <button
                onClick={() => handleAddBlock('code')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
              >
                <CodeBracketIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Code Block</div>
                  <div className="text-xs text-gray-500">Syntax highlighted code</div>
                </div>
              </button>

              <button
                onClick={() => handleAddBlock('callout')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Callout</div>
                  <div className="text-xs text-gray-500">Info, warning, or tip box</div>
                </div>
              </button>

              <button
                onClick={() => handleAddBlock('image')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
              >
                <PhotoIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Image</div>
                  <div className="text-xs text-gray-500">Add an image with caption</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
