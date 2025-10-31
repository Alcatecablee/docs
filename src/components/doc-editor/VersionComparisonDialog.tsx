import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Documentation, Section, ContentBlock } from '../../../shared/doc-editor-types';
import { ExclamationTriangleIcon, CheckCircleIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { diff } from 'just-diff';

interface VersionComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocumentation: Documentation | null;
  originalDocumentation: Documentation | null;
  onRevertAll: () => void;
}

type DiffType = 'add' | 'remove' | 'replace' | 'unchanged';

interface SectionDiff {
  sectionId: string;
  title: string;
  icon: string;
  diffType: DiffType;
  originalSection?: Section;
  currentSection?: Section;
  blockDiffs: BlockDiff[];
}

interface BlockDiff {
  blockId: string;
  diffType: DiffType;
  originalBlock?: ContentBlock;
  currentBlock?: ContentBlock;
  textDiff?: { original: string; current: string; hasChanges: boolean };
}

function getBlockText(block: ContentBlock): string {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'callout':
      return block.text || '';
    case 'code':
      return block.code || '';
    case 'list':
      return block.items?.join('\n') || '';
    case 'image':
      return block.altText || block.url || '';
    default:
      return '';
  }
}

function computeSectionDiffs(
  original: Documentation,
  current: Documentation
): SectionDiff[] {
  const sectionDiffs: SectionDiff[] = [];
  
  const originalSectionsById = new Map<string, Section>();
  original.sections.forEach(section => originalSectionsById.set(section.id, section));
  
  const currentSectionsById = new Map<string, Section>();
  current.sections.forEach(section => currentSectionsById.set(section.id, section));
  
  const allSectionIds = new Set([
    ...original.sections.map(s => s.id),
    ...current.sections.map(s => s.id),
  ]);

  allSectionIds.forEach(sectionId => {
    const originalSection = originalSectionsById.get(sectionId);
    const currentSection = currentSectionsById.get(sectionId);

    if (!originalSection && currentSection) {
      sectionDiffs.push({
        sectionId: currentSection.id,
        title: currentSection.title,
        icon: currentSection.icon,
        diffType: 'add',
        currentSection,
        blockDiffs: currentSection.content.map(block => ({
          blockId: block.id,
          diffType: 'add',
          currentBlock: block,
          textDiff: { original: '', current: getBlockText(block), hasChanges: true },
        })),
      });
    } else if (originalSection && !currentSection) {
      sectionDiffs.push({
        sectionId: originalSection.id,
        title: originalSection.title,
        icon: originalSection.icon,
        diffType: 'remove',
        originalSection,
        blockDiffs: originalSection.content.map(block => ({
          blockId: block.id,
          diffType: 'remove',
          originalBlock: block,
          textDiff: { original: getBlockText(block), current: '', hasChanges: true },
        })),
      });
    } else if (originalSection && currentSection) {
      const blockDiffs = computeBlockDiffs(originalSection.content, currentSection.content);
      const hasChanges = 
        blockDiffs.some(bd => bd.diffType !== 'unchanged') ||
        originalSection.title !== currentSection.title;

      sectionDiffs.push({
        sectionId: currentSection.id,
        title: currentSection.title,
        icon: currentSection.icon,
        diffType: hasChanges ? 'replace' : 'unchanged',
        originalSection,
        currentSection,
        blockDiffs,
      });
    }
  });

  return sectionDiffs.sort((a, b) => {
    const aIndex = current.sections.findIndex(s => s.id === a.sectionId);
    const bIndex = current.sections.findIndex(s => s.id === b.sectionId);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

function computeBlockDiffs(
  originalBlocks: ContentBlock[],
  currentBlocks: ContentBlock[]
): BlockDiff[] {
  const blockDiffs: BlockDiff[] = [];
  
  const originalBlocksById = new Map<string, ContentBlock>();
  originalBlocks.forEach(block => originalBlocksById.set(block.id, block));
  
  const currentBlocksById = new Map<string, ContentBlock>();
  currentBlocks.forEach(block => currentBlocksById.set(block.id, block));
  
  const allBlockIds = new Set([
    ...originalBlocks.map(b => b.id),
    ...currentBlocks.map(b => b.id),
  ]);

  allBlockIds.forEach(blockId => {
    const originalBlock = originalBlocksById.get(blockId);
    const currentBlock = currentBlocksById.get(blockId);

    if (!originalBlock && currentBlock) {
      blockDiffs.push({
        blockId: currentBlock.id,
        diffType: 'add',
        currentBlock,
        textDiff: { original: '', current: getBlockText(currentBlock), hasChanges: true },
      });
    } else if (originalBlock && !currentBlock) {
      blockDiffs.push({
        blockId: originalBlock.id,
        diffType: 'remove',
        originalBlock,
        textDiff: { original: getBlockText(originalBlock), current: '', hasChanges: true },
      });
    } else if (originalBlock && currentBlock) {
      const originalText = getBlockText(originalBlock);
      const currentText = getBlockText(currentBlock);
      const hasChanges = originalText !== currentText || originalBlock.type !== currentBlock.type;

      blockDiffs.push({
        blockId: currentBlock.id,
        diffType: hasChanges ? 'replace' : 'unchanged',
        originalBlock,
        currentBlock,
        textDiff: { original: originalText, current: currentText, hasChanges },
      });
    }
  });

  return blockDiffs.sort((a, b) => {
    const aIndex = currentBlocks.findIndex(b => b.id === a.blockId);
    const bIndex = currentBlocks.findIndex(b => b.id === b.blockId);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

export function VersionComparisonDialog({
  isOpen,
  onClose,
  currentDocumentation,
  originalDocumentation,
  onRevertAll,
}: VersionComparisonDialogProps) {
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);

  const sectionDiffs = useMemo(() => {
    if (!currentDocumentation || !originalDocumentation) return [];
    return computeSectionDiffs(originalDocumentation, currentDocumentation);
  }, [currentDocumentation, originalDocumentation]);

  const hasChanges = sectionDiffs.some(sd => sd.diffType !== 'unchanged');

  const handleRevert = () => {
    onRevertAll();
    setShowRevertConfirm(false);
    onClose();
  };

  if (!currentDocumentation || !originalDocumentation) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Version Comparison
            {hasChanges ? (
              <Badge variant="default" className="text-xs">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1 inline" />
                Modified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-green-600">
                <CheckCircleIcon className="h-3 w-3 mr-1 inline" />
                No Changes
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Compare your edited version with the original AI-generated documentation. Reordering sections doesn't count as a change.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 mt-4">
            {sectionDiffs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sections found
              </div>
            )}
            
            {sectionDiffs.map((sectionDiff) => (
              <div key={sectionDiff.sectionId} className="border rounded-lg overflow-hidden">
                <div 
                  className={`px-4 py-2 flex items-center gap-2 ${
                    sectionDiff.diffType === 'add' ? 'bg-green-50 border-l-4 border-green-500' :
                    sectionDiff.diffType === 'remove' ? 'bg-red-50 border-l-4 border-red-500' :
                    sectionDiff.diffType === 'replace' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                    'bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{sectionDiff.icon}</span>
                  <h4 className="text-sm font-semibold text-gray-900">{sectionDiff.title}</h4>
                  {sectionDiff.diffType === 'add' && (
                    <Badge variant="default" className="ml-auto text-xs bg-green-600">
                      <PlusIcon className="h-3 w-3 mr-1 inline" />
                      Added
                    </Badge>
                  )}
                  {sectionDiff.diffType === 'remove' && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      <MinusIcon className="h-3 w-3 mr-1 inline" />
                      Removed
                    </Badge>
                  )}
                  {sectionDiff.diffType === 'replace' && (
                    <Badge variant="default" className="ml-auto text-xs bg-yellow-600">
                      Modified
                    </Badge>
                  )}
                </div>

                <div className="p-4 space-y-2 bg-white">
                  {sectionDiff.blockDiffs.map((blockDiff, idx) => {
                    if (blockDiff.diffType === 'unchanged') {
                      return null;
                    }
                    
                    return (
                      <div key={`${blockDiff.blockId}-${idx}`}>
                        {blockDiff.diffType === 'add' && blockDiff.currentBlock && (
                          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="default" className="text-xs bg-green-600">
                                <PlusIcon className="h-3 w-3 mr-1 inline" />
                                Added
                              </Badge>
                              <span className="text-xs text-gray-600">
                                {blockDiff.currentBlock.type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-900 whitespace-pre-wrap">
                              {blockDiff.textDiff?.current}
                            </div>
                          </div>
                        )}

                        {blockDiff.diffType === 'remove' && blockDiff.originalBlock && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="destructive" className="text-xs">
                                <MinusIcon className="h-3 w-3 mr-1 inline" />
                                Removed
                              </Badge>
                              <span className="text-xs text-gray-600">
                                {blockDiff.originalBlock.type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-900 line-through whitespace-pre-wrap">
                              {blockDiff.textDiff?.original}
                            </div>
                          </div>
                        )}

                        {blockDiff.diffType === 'replace' && blockDiff.textDiff?.hasChanges && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="default" className="text-xs bg-yellow-600">
                                Modified
                              </Badge>
                              <span className="text-xs text-gray-600">
                                {blockDiff.currentBlock?.type || blockDiff.originalBlock?.type}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-700">Original:</p>
                                <div className="text-sm text-red-700 bg-red-100 p-2 rounded line-through whitespace-pre-wrap">
                                  {blockDiff.textDiff.original}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-700">Edited:</p>
                                <div className="text-sm text-green-700 bg-green-100 p-2 rounded whitespace-pre-wrap">
                                  {blockDiff.textDiff.current}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {sectionDiff.diffType === 'unchanged' && (
                    <div className="p-2 text-sm text-gray-500 italic text-center">
                      No changes in this section
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          {hasChanges && !showRevertConfirm && (
            <Button
              variant="destructive"
              onClick={() => setShowRevertConfirm(true)}
            >
              Revert All Changes
            </Button>
          )}
          
          {showRevertConfirm && (
            <div className="flex items-center gap-2 mr-auto">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-600 font-medium">
                Are you sure? This will discard all your edits.
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowRevertConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRevert}>
                Yes, Revert
              </Button>
            </div>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
