import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import type { Section } from '../../../shared/doc-editor-types';

interface AddSectionButtonProps {
  onAddSection: (section: Section, index?: number) => void;
  insertIndex?: number;
}

const sectionTemplates = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    description: 'Introduction and setup instructions',
  },
  {
    id: 'installation',
    title: 'Installation',
    icon: '📦',
    description: 'How to install and configure',
  },
  {
    id: 'usage',
    title: 'Usage',
    icon: '💻',
    description: 'Basic usage examples',
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: '📚',
    description: 'API documentation',
  },
  {
    id: 'examples',
    title: 'Examples',
    icon: '✨',
    description: 'Code examples and demos',
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: '❓',
    description: 'Frequently asked questions',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔧',
    description: 'Common issues and solutions',
  },
  {
    id: 'custom',
    title: 'Custom Section',
    icon: '📝',
    description: 'Create a blank section',
  },
];

export function AddSectionButton({ onAddSection, insertIndex }: AddSectionButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAddSection = (template: typeof sectionTemplates[0]) => {
    const newSection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: template.title,
      icon: template.icon,
      content: [
        {
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'paragraph',
          text: `This is the ${template.title} section. Click to edit...`,
        },
      ],
    };

    onAddSection(newSection, insertIndex);
    setShowMenu(false);
  };

  return (
    <div className="relative my-8 group">
      {/* Add Section Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100"
        title="Add new section"
      >
        <PlusCircleIcon className="h-5 w-5" />
        <span>Add Section</span>
      </button>

      {/* Template Selector Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Choose a section template</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="p-2 space-y-1">
                {sectionTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleAddSection(template)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{template.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
