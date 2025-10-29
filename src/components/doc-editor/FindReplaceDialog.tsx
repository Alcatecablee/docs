import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import type { Documentation } from '../../../shared/doc-editor-types';

interface FindReplaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentation: Documentation | null;
  onReplace: (sectionId: string, blockId: string, newContent: string, blockType: string) => void;
}

interface SearchMatch {
  sectionId: string;
  sectionTitle: string;
  blockId: string;
  blockType: string;
  text: string;
  matchIndex: number;
  matchLength: number;
}

export function FindReplaceDialog({
  isOpen,
  onClose,
  documentation,
  onReplace,
}: FindReplaceDialogProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Search for matches
  useEffect(() => {
    if (!findText || !documentation) {
      setMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const foundMatches: SearchMatch[] = [];
    let searchPattern: RegExp;

    try {
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(findText, flags);
      } else {
        const escapedText = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(escapedText, flags);
      }

      documentation.sections.forEach((section) => {
        section.content.forEach((block) => {
          let searchableText = '';
          
          // Extract searchable text based on block type
          if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'callout') {
            searchableText = block.text || '';
          } else if (block.type === 'code') {
            searchableText = block.code || '';
          } else if ((block.type === 'list' || block.type === 'ordered-list') && block.items) {
            // Join list items with newlines for proper searching and replacement
            searchableText = block.items.join('\n');
          }

          if (!searchableText) return;

          // Find all matches in this block
          const blockMatches = Array.from(searchableText.matchAll(searchPattern));
          blockMatches.forEach((match) => {
            foundMatches.push({
              sectionId: section.id,
              sectionTitle: section.title,
              blockId: block.id,
              blockType: block.type,
              text: searchableText,
              matchIndex: match.index || 0,
              matchLength: match[0].length,
            });
          });
        });
      });

      setMatches(foundMatches);
      setCurrentMatchIndex(foundMatches.length > 0 ? 0 : -1);
    } catch (error) {
      console.error('Search error:', error);
      setMatches([]);
    }
  }, [findText, documentation, caseSensitive, useRegex]);

  const handleReplaceOne = () => {
    if (matches.length === 0 || currentMatchIndex < 0) return;

    const match = matches[currentMatchIndex];
    const newContent = match.text.substring(0, match.matchIndex) +
                       replaceText +
                       match.text.substring(match.matchIndex + match.matchLength);

    onReplace(match.sectionId, match.blockId, newContent, match.blockType);

    // Move to next match
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    }
  };

  const handleReplaceAll = () => {
    if (matches.length === 0) return;

    // Group matches by block for efficient replacement
    const matchesByBlock = new Map<string, SearchMatch[]>();
    matches.forEach((match) => {
      const key = `${match.sectionId}:${match.blockId}`;
      if (!matchesByBlock.has(key)) {
        matchesByBlock.set(key, []);
      }
      matchesByBlock.get(key)!.push(match);
    });

    // Replace all matches in each block (from end to start to maintain indices)
    matchesByBlock.forEach((blockMatches, key) => {
      const [sectionId, blockId] = key.split(':');
      let newContent = blockMatches[0].text;
      const blockType = blockMatches[0].blockType;

      // Sort by index descending to replace from end to start
      blockMatches.sort((a, b) => b.matchIndex - a.matchIndex);
      
      blockMatches.forEach((match) => {
        newContent = newContent.substring(0, match.matchIndex) +
                     replaceText +
                     newContent.substring(match.matchIndex + match.matchLength);
      });

      onReplace(sectionId, blockId, newContent, blockType);
    });

    setMatches([]);
    setFindText('');
  };

  const handleNext = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((currentMatchIndex + 1) % matches.length);
  };

  const handlePrevious = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((currentMatchIndex - 1 + matches.length) % matches.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Find and Replace</DialogTitle>
          <DialogDescription>
            Search and replace text across all documentation sections
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Find Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Find</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="Search text..."
                  className="pl-9"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={matches.length === 0}
                  title="Previous match"
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleNext}
                  disabled={matches.length === 0}
                  title="Next match"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {matches.length > 0 && (
              <p className="text-xs text-gray-500">
                {currentMatchIndex + 1} of {matches.length} matches
              </p>
            )}
          </div>

          {/* Replace Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Replace with</label>
            <Input
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
            />
          </div>

          {/* Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded"
              />
              Case sensitive
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={(e) => setUseRegex(e.target.checked)}
                className="rounded"
              />
              Use regex
            </label>
          </div>

          {/* Current Match Preview */}
          {matches.length > 0 && currentMatchIndex >= 0 && (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-1">
                {matches[currentMatchIndex].sectionTitle} • {matches[currentMatchIndex].blockType}
              </div>
              <div className="text-sm">
                {matches[currentMatchIndex].text.substring(
                  Math.max(0, matches[currentMatchIndex].matchIndex - 20),
                  matches[currentMatchIndex].matchIndex
                )}
                <span className="bg-yellow-200 font-semibold">
                  {matches[currentMatchIndex].text.substring(
                    matches[currentMatchIndex].matchIndex,
                    matches[currentMatchIndex].matchIndex + matches[currentMatchIndex].matchLength
                  )}
                </span>
                {matches[currentMatchIndex].text.substring(
                  matches[currentMatchIndex].matchIndex + matches[currentMatchIndex].matchLength,
                  Math.min(
                    matches[currentMatchIndex].text.length,
                    matches[currentMatchIndex].matchIndex + matches[currentMatchIndex].matchLength + 20
                  )
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleReplaceOne}
              disabled={matches.length === 0}
            >
              Replace
            </Button>
            <Button
              variant="default"
              onClick={handleReplaceAll}
              disabled={matches.length === 0}
            >
              Replace All ({matches.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
