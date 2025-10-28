/**
 * Real-Time Documentation Editor Types
 * Shared interfaces for the built-in doc editor (Phase 1-6)
 */

// ========================================
// CONTENT BLOCKS
// ========================================

export type ContentBlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'list' 
  | 'ordered-list' 
  | 'code' 
  | 'callout' 
  | 'image';

export type CalloutType = 'info' | 'warning' | 'error' | 'success' | 'tip';

export interface ContentBlock {
  id: string; // Unique ID for each block (for drag-and-drop)
  type: ContentBlockType;
  
  // Text content (paragraph, heading, callout)
  text?: string;
  
  // Heading specific
  level?: 2 | 3 | 4 | 5 | 6; // H2-H6 (H1 is section title)
  
  // List specific
  items?: string[];
  
  // Code block specific
  language?: string;
  code?: string;
  
  // Callout specific
  calloutType?: CalloutType;
  
  // Image specific
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

// ========================================
// SECTIONS
// ========================================

export interface Section {
  id: string; // Unique ID for drag-and-drop
  title: string;
  icon: string; // Emoji or icon identifier
  content: ContentBlock[];
  collapsed?: boolean; // For editor UI only
}

// ========================================
// DOCUMENTATION STRUCTURE
// ========================================

export interface Documentation {
  title: string;
  description: string;
  sections: Section[];
  metadata?: DocumentationMetadata;
}

export interface DocumentationMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  version?: string;
  lastUpdated?: string;
}

// ========================================
// EDITOR STATE
// ========================================

export interface EditorState {
  // Current document
  documentation: Documentation;
  
  // Edit tracking
  isDirty: boolean; // Has user made any edits?
  isEditing: boolean; // Is edit mode active?
  
  // History for undo/redo (Phase 4)
  history: HistoryEntry[];
  historyIndex: number;
  
  // Selection/focus
  selectedBlockId?: string;
  selectedSectionId?: string;
}

export interface HistoryEntry {
  documentation: Documentation;
  timestamp: number;
  action: string; // e.g., "Edit paragraph", "Delete section"
}

// ========================================
// EDITOR ACTIONS (for useDocEditor hook)
// ========================================

export type EditorAction =
  // Document-level
  | { type: 'LOAD_DOCUMENTATION'; payload: Documentation }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'RESET_TO_ORIGINAL' }
  
  // Section-level
  | { type: 'UPDATE_SECTION'; payload: { sectionId: string; updates: Partial<Section> } }
  | { type: 'ADD_SECTION'; payload: { section: Section; index?: number } }
  | { type: 'DELETE_SECTION'; payload: { sectionId: string } }
  | { type: 'MOVE_SECTION'; payload: { sectionId: string; newIndex: number } }
  | { type: 'TOGGLE_SECTION_COLLAPSE'; payload: { sectionId: string } }
  
  // Block-level
  | { type: 'UPDATE_BLOCK'; payload: { sectionId: string; blockId: string; updates: Partial<ContentBlock> } }
  | { type: 'ADD_BLOCK'; payload: { sectionId: string; block: ContentBlock; index?: number } }
  | { type: 'DELETE_BLOCK'; payload: { sectionId: string; blockId: string } }
  | { type: 'MOVE_BLOCK'; payload: { sectionId: string; blockId: string; newIndex: number } }
  
  // History
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_HISTORY'; payload: { action: string } };

// ========================================
// UI PROPS
// ========================================

export interface EditableDocViewerProps {
  documentation: Documentation | null;
  isEditing: boolean;
  onDocumentChange?: (doc: Documentation) => void;
  onEditModeToggle?: () => void;
  isLoading?: boolean;
}

export interface SectionComponentProps {
  section: Section;
  isEditing: boolean;
  onSectionUpdate?: (updates: Partial<Section>) => void;
  onSectionDelete?: () => void;
  onSectionMove?: (direction: 'up' | 'down') => void;
}

export interface ContentBlockComponentProps {
  block: ContentBlock;
  isEditing: boolean;
  onBlockUpdate?: (updates: Partial<ContentBlock>) => void;
  onBlockDelete?: () => void;
  onBlockMove?: (direction: 'up' | 'down') => void;
}

// ========================================
// PREVIEW DATA (from generation pipeline)
// ========================================

export interface PreviewData {
  // Raw AI-generated structure
  title?: string;
  description?: string;
  sections?: any[]; // Raw section data from AI
  
  // Or structured documentation (after parsing)
  documentation?: Documentation;
}
