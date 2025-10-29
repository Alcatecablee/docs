import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SectionToolbarProps {
  sectionId: string;
  sectionTitle: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SectionToolbar({
  sectionId,
  sectionTitle,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
}: SectionToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
    setShowMenu(false);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="relative">
        {/* Toolbar Button - appears on hover */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-md"
          title="Section options"
        >
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
              <div className="py-1">
                {/* Move Up */}
                <button
                  onClick={() => {
                    onMoveUp();
                    setShowMenu(false);
                  }}
                  disabled={isFirst}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                  <span>Move Up</span>
                </button>

                {/* Move Down */}
                <button
                  onClick={() => {
                    onMoveDown();
                    setShowMenu(false);
                  }}
                  disabled={isLast}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  <span>Move Down</span>
                </button>

                <div className="border-t border-gray-200 my-1" />

                {/* Duplicate */}
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 text-left"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 text-gray-500" />
                  <span>Duplicate Section</span>
                </button>

                <div className="border-t border-gray-200 my-1" />

                {/* Delete */}
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-50 text-red-600 text-left"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete Section</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the section "{sectionTitle}"? This action cannot be undone, but you can use Undo (Cmd+Z) to restore it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
