/**
 * useDocEditor Hook
 * State management for the real-time documentation editor
 * Phase 3: Undo/redo, edit tracking, auto-save
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Documentation, EditorState, EditorAction, ContentBlock } from '../../shared/doc-editor-types';

const MAX_HISTORY_SIZE = 50; // Maximum number of undo/redo steps

export interface UseDocEditorResult {
  // State
  documentation: Documentation | null;
  isEditing: boolean;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  
  // Actions
  loadDocumentation: (doc: Documentation) => void;
  toggleEditMode: () => void;
  resetToOriginal: () => void;
  undo: () => void;
  redo: () => void;
  
  // Edit actions
  updateSection: (sectionId: string, updates: any) => void;
  addSection: (section: any, index?: number) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  duplicateSection: (sectionId: string) => void;
  updateBlock: (sectionId: string, blockId: string, updates: any) => void;
  addBlock: (sectionId: string, block: ContentBlock, insertAfterBlockId?: string) => void;
  
  // Phase 3: Save/Publish
  saveDraft: (documentationId: number) => Promise<void>;
  publish: (documentationId: number) => Promise<void>;
  markClean: () => void;
}

export function useDocEditor(): UseDocEditorResult {
  const [state, setState] = useState<EditorState>({
    documentation: {
      title: '',
      description: '',
      sections: [],
    },
    isDirty: false,
    isEditing: false,
    history: [],
    historyIndex: -1,
  });
  
  const [originalDoc, setOriginalDoc] = useState<Documentation | null>(null);
  
  // Track if we're in an undo/redo operation to prevent adding to history
  const isUndoRedoOperation = useRef(false);

  // ========================================
  // PHASE 1: Basic State Management
  // ========================================

  const loadDocumentation = useCallback((doc: Documentation) => {
    // Seed history with initial state
    const initialHistory = [{
      documentation: JSON.parse(JSON.stringify(doc)),
      timestamp: Date.now(),
      action: 'Load documentation',
    }];
    
    setState(prev => ({
      ...prev,
      documentation: doc,
      isDirty: false,
      isEditing: false,
      history: initialHistory,
      historyIndex: 0,
    }));
    setOriginalDoc(doc); // Save original for reset
  }, []);

  const toggleEditMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: !prev.isEditing,
    }));
  }, []);

  const resetToOriginal = useCallback(() => {
    if (originalDoc) {
      setState(prev => ({
        ...prev,
        documentation: originalDoc,
        isDirty: false,
      }));
    }
  }, [originalDoc]);

  // ========================================
  // PHASE 3: History Management
  // ========================================

  const addToHistory = useCallback((documentation: Documentation, actionDescription: string) => {
    if (isUndoRedoOperation.current) return;
    
    setState(prev => {
      // Remove any history after current index (when editing after undo)
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      
      // Add new history entry
      newHistory.push({
        documentation: JSON.parse(JSON.stringify(documentation)), // Deep copy
        timestamp: Date.now(),
        action: actionDescription,
      });
      
      // Trim history if it exceeds max size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }
      
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;
      
      isUndoRedoOperation.current = true;
      
      // Go back one step in history
      const previousEntry = prev.history[prev.historyIndex - 1];
      
      setTimeout(() => {
        isUndoRedoOperation.current = false;
      }, 0);
      
      return {
        ...prev,
        documentation: previousEntry.documentation,
        historyIndex: prev.historyIndex - 1,
        isDirty: true,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      
      isUndoRedoOperation.current = true;
      
      // Move forward one step in history
      const nextEntry = prev.history[prev.historyIndex + 1];
      
      setTimeout(() => {
        isUndoRedoOperation.current = false;
      }, 0);
      
      return {
        ...prev,
        documentation: nextEntry.documentation,
        historyIndex: prev.historyIndex + 1,
        isDirty: true,
      };
    });
  }, []);

  // ========================================
  // PHASE 3: Edit Actions with History
  // ========================================

  const updateSection = useCallback((sectionId: string, updates: any) => {
    setState(prev => {
      // Add CURRENT state to history BEFORE mutating
      addToHistory(prev.documentation, 'Update section');
      
      const newDoc = { ...prev.documentation };
      const sectionIndex = newDoc.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex === -1) return prev;
      
      const oldSection = newDoc.sections[sectionIndex];
      newDoc.sections = [...newDoc.sections];
      newDoc.sections[sectionIndex] = { ...oldSection, ...updates };
      
      return {
        ...prev,
        documentation: newDoc,
        isDirty: true,
      };
    });
  }, [addToHistory]);

  const addSection = useCallback((section: any, index?: number) => {
    setState(prev => {
      // Add CURRENT state to history BEFORE mutating
      addToHistory(prev.documentation, `Add section: ${section.title}`);
      
      const newDoc = { ...prev.documentation };
      const insertIndex = index !== undefined ? index : newDoc.sections.length;
      
      newDoc.sections = [...newDoc.sections];
      newDoc.sections.splice(insertIndex, 0, section);
      
      return {
        ...prev,
        documentation: newDoc,
        isDirty: true,
      };
    });
  }, [addToHistory]);

  const deleteSection = useCallback((sectionId: string) => {
    setState(prev => {
      const deletedSection = prev.documentation.sections.find(s => s.id === sectionId);
      
      // Add CURRENT state to history BEFORE mutating
      addToHistory(prev.documentation, `Delete section: ${deletedSection?.title || 'Unknown'}`);
      
      const newDoc = { ...prev.documentation };
      newDoc.sections = newDoc.sections.filter(s => s.id !== sectionId);
      
      return {
        ...prev,
        documentation: newDoc,
        isDirty: true,
      };
    });
  }, [addToHistory]);

  const updateBlock = useCallback((sectionId: string, blockId: string, updates: any) => {
    setState(prev => {
      // Find the block to get its type for the history message
      const section = prev.documentation.sections.find(s => s.id === sectionId);
      const block = section?.content.find(b => b.id === blockId);
      
      // Add CURRENT state to history BEFORE mutating
      addToHistory(prev.documentation, `Edit ${block?.type || 'block'}`);
      
      const newDoc = { ...prev.documentation };
      
      // Find the section
      const sectionIndex = newDoc.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return prev;
      
      // Clone the section
      const newSection = { ...newDoc.sections[sectionIndex] };
      
      // Find and update the block
      const blockIndex = newSection.content.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prev;
      
      newSection.content = [...newSection.content];
      newSection.content[blockIndex] = {
        ...newSection.content[blockIndex],
        ...updates
      };
      
      // Update the section in the document
      newDoc.sections = [...newDoc.sections];
      newDoc.sections[sectionIndex] = newSection;
      
      return {
        ...prev,
        documentation: newDoc,
        isDirty: true
      };
    });
  }, [addToHistory]);

  const addBlock = useCallback((sectionId: string, block: ContentBlock, insertAfterBlockId?: string) => {
    setState(prev => {
      // Add CURRENT state to history BEFORE mutating
      addToHistory(prev.documentation, `Add ${block.type} block`);
      
      const newDoc = { ...prev.documentation };
      const sectionIndex = newDoc.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex === -1) return prev;
      
      const section = newDoc.sections[sectionIndex];
      const newContent = [...section.content];
      
      if (insertAfterBlockId) {
        const afterIndex = newContent.findIndex(b => b.id === insertAfterBlockId);
        if (afterIndex !== -1) {
          newContent.splice(afterIndex + 1, 0, block);
        } else {
          newContent.push(block);
        }
      } else {
        newContent.push(block);
      }
      
      newDoc.sections = [...newDoc.sections];
      newDoc.sections[sectionIndex] = { ...section, content: newContent };
      
      return {
        ...prev,
        documentation: newDoc,
        isDirty: true,
      };
    });
  }, [addToHistory]);

  // Compute derived state
  const canUndo = state.historyIndex >= 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // ========================================
  // PHASE 3: Save/Publish Actions
  // ========================================

  const saveDraft = useCallback(async (documentationId: number) => {
    if (!state.documentation) {
      throw new Error('No documentation to save');
    }

    const response = await fetch(`/api/documentations/${documentationId}/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        content: state.documentation,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save draft');
    }

    // Mark as clean after successful save
    setState(prev => ({
      ...prev,
      isDirty: false,
    }));
  }, [state.documentation]);

  const publish = useCallback(async (documentationId: number) => {
    if (!state.documentation) {
      throw new Error('No documentation to publish');
    }

    if (state.isDirty) {
      throw new Error('Please save your changes before publishing');
    }

    const response = await fetch(`/api/documentations/${documentationId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to publish');
    }

    // Update original doc after publishing
    setOriginalDoc(state.documentation);
  }, [state.documentation, state.isDirty]);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setState(prev => {
      const sectionIndex = prev.documentation.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex === -1) return prev;
      
      // Can't move first section up or last section down
      if ((direction === 'up' && sectionIndex === 0) || 
          (direction === 'down' && sectionIndex === prev.documentation.sections.length - 1)) {
        return prev;
      }
      
      // Add CURRENT state to history BEFORE mutating
      addToHistory(prev.documentation, `Move section ${direction}`);
      
      const newDoc = { ...prev.documentation };
      const newSections = [...newDoc.sections];
      const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
      
      // Swap sections
      [newSections[sectionIndex], newSections[targetIndex]] = 
        [newSections[targetIndex], newSections[sectionIndex]];
      
      newDoc.sections = newSections;
      
      return {
        ...prev,
        documentation: newDoc,
        isDirty: true,
      };
    });
  }, [addToHistory]);

  const duplicateSection = useCallback((sectionId: string) => {
    setState(prev => {
      const sectionIndex = prev.documentation.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex === -1) return prev;
      
      const originalSection = prev.documentation.sections[sectionIndex];
      
      // Add CURRENT state to history BEFORE mutating
      addToHistory(prev.documentation, `Duplicate section: ${originalSection.title}`);
      
      // Create a deep copy of the section with new IDs
      const duplicatedSection = {
        ...originalSection,
        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${originalSection.title} (Copy)`,
        content: originalSection.content.map(block => ({
          ...block,
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      };
      
      const newDoc = { ...prev.documentation };
      newDoc.sections = [...newDoc.sections];
      newDoc.sections.splice(sectionIndex + 1, 0, duplicatedSection);
      
      return {
        ...prev,
        documentation: newDoc,
        isDirty: true,
      };
    });
  }, [addToHistory]);

  const markClean = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDirty: false,
    }));
  }, []);

  return {
    documentation: state.documentation,
    isEditing: state.isEditing,
    isDirty: state.isDirty,
    canUndo,
    canRedo,
    loadDocumentation,
    toggleEditMode,
    resetToOriginal,
    undo,
    redo,
    updateSection,
    addSection,
    deleteSection,
    moveSection,
    duplicateSection,
    updateBlock,
    addBlock,
    saveDraft,
    publish,
    markClean,
  };
}
