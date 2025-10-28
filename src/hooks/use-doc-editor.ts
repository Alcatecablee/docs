/**
 * useDocEditor Hook
 * State management for the real-time documentation editor
 * Phase 1: Basic state management (read-only)
 * Future: Undo/redo, edit tracking, auto-save
 */

import { useState, useCallback, useEffect } from 'react';
import type { Documentation, EditorState, EditorAction } from '../../shared/doc-editor-types';

export interface UseDocEditorResult {
  // State
  documentation: Documentation | null;
  isEditing: boolean;
  isDirty: boolean;
  
  // Actions
  loadDocumentation: (doc: Documentation) => void;
  toggleEditMode: () => void;
  resetToOriginal: () => void;
  
  // Future: Phase 2-4 actions
  updateSection: (sectionId: string, updates: any) => void;
  addSection: (section: any, index?: number) => void;
  deleteSection: (sectionId: string) => void;
  updateBlock: (sectionId: string, blockId: string, updates: any) => void;
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

  // ========================================
  // PHASE 1: Basic State Management
  // ========================================

  const loadDocumentation = useCallback((doc: Documentation) => {
    setState(prev => ({
      ...prev,
      documentation: doc,
      isDirty: false,
      isEditing: false,
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
  // PHASE 2-4: Edit Actions (Placeholders)
  // ========================================

  const updateSection = useCallback((sectionId: string, updates: any) => {
    // TODO: Phase 3 - Implement section updates
    console.log('updateSection (Phase 3):', sectionId, updates);
  }, []);

  const addSection = useCallback((section: any, index?: number) => {
    // TODO: Phase 3 - Implement add section
    console.log('addSection (Phase 3):', section, index);
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    // TODO: Phase 3 - Implement delete section
    console.log('deleteSection (Phase 3):', sectionId);
  }, []);

  const updateBlock = useCallback((sectionId: string, blockId: string, updates: any) => {
    setState(prev => {
      const newDoc = { ...prev.documentation };
      
      // Find the section
      const sectionIndex = newDoc.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return prev;
      
      // Clone the section
      const section = { ...newDoc.sections[sectionIndex] };
      
      // Find and update the block
      const blockIndex = section.content.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prev;
      
      section.content = [...section.content];
      section.content[blockIndex] = {
        ...section.content[blockIndex],
        ...updates
      };
      
      // Update the section in the document
      newDoc.sections = [...newDoc.sections];
      newDoc.sections[sectionIndex] = section;
      
      return {
        ...prev,
        documentation: newDoc,
        isDirty: true
      };
    });
  }, []);

  return {
    documentation: state.documentation,
    isEditing: state.isEditing,
    isDirty: state.isDirty,
    loadDocumentation,
    toggleEditMode,
    resetToOriginal,
    updateSection,
    addSection,
    deleteSection,
    updateBlock,
  };
}
