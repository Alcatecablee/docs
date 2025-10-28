# Real-Time Doc Editor Roadmap
## Built-In Page Builder for Documentation (Pre-Export Editing)

---

## 🎯 Vision

Transform ViberDoc from a **"generate & export"** tool into an **"AI-assisted documentation platform"** where users can:
- Generate 80-90% quality docs with AI
- Refine the last 10-20% with a modern page builder
- Export polished, production-ready documentation

**User Flow**: 
```
Enter URL → AI Generates Docs → Edit in Real-Time → Export Perfect Docs
```

---

## 📋 Current State Assessment

### ✅ **Already Implemented**
1. **Three-Panel Layout** (`GenerationProgress.tsx`):
   - LEFT: Activity logs & metrics
   - CENTER: Stage progress & controls
   - RIGHT: Preview column (currently shows raw text preview)

2. **Generation Pipeline**:
   - Server-side doc generation working
   - Real-time progress via Server-Sent Events (SSE)
   - Section-based documentation structure
   - Content blocks (paragraph, heading, list, code, callout, image)

3. **Export Formats**:
   - PDF, DOCX, HTML, Markdown, JSON
   - Enterprise-quality templates
   - Static site generation with navigation/search

### ❌ **Not Implemented (Need to Build)**
1. **Live Doc Editor** in preview column
2. **Content Block Editing** (paragraphs, code, images)
3. **Section Management** (add, delete, reorder)
4. **Rich Text Editing** capabilities
5. **Undo/Redo** functionality
6. **Save Draft** state management
7. **Export edited version** (not just AI-generated)

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation & Read-Only Preview** ⏳ CURRENT PHASE
**Goal**: Transform raw preview into rendered documentation viewer

**Tasks**:
1. ✅ **Audit Current Preview Column** (`GenerationProgress.tsx` lines 609-1299)
   - Identify where `previewContent` is displayed
   - Check data structure of generated docs
   - Map section/content block schema

2. **Implement Read-Only Doc Viewer**
   - [ ] Create `<EditableDocViewer>` component
   - [ ] Render sections with proper formatting
   - [ ] Display content blocks (paragraph, heading, list, code, callout, image)
   - [ ] Apply syntax highlighting to code blocks
   - [ ] Add section anchors for navigation
   - [ ] Implement smooth scrolling between sections

3. **State Management Setup**
   - [ ] Create `useDocEditor` hook for state management
   - [ ] Schema: `{ sections: Section[], metadata: Metadata, isDirty: boolean }`
   - [ ] Initialize state from AI-generated docs
   - [ ] Track user edits separately from original

4. **UI/UX Polish**
   - [ ] Add loading states during generation
   - [ ] Show "Preview" badge when in read-only mode
   - [ ] Add "Edit Mode" toggle button (disabled until Phase 2)
   - [ ] Responsive design (mobile-friendly)

**Success Criteria**:
- ✅ Users see beautifully formatted preview during generation
- ✅ Preview updates in real-time as AI generates sections
- ✅ All content blocks render correctly
- ✅ State management infrastructure ready for editing

**Estimated Time**: 1-2 days

---

### **Phase 2: Block-Level Editing** 🎨
**Goal**: Enable inline editing of individual content blocks

**Tasks**:
1. **Editable Paragraph Blocks**
   - [ ] Replace static `<p>` with `<ContentEditable>` or rich text editor
   - [ ] Use **Tiptap** or **Lexical** for rich text (recommended: Tiptap)
   - [ ] Support: bold, italic, links, inline code
   - [ ] Auto-save changes to state on blur
   - [ ] Show edit indicator on hover

2. **Editable Heading Blocks**
   - [ ] Inline heading editing with level selector (H2, H3, H4)
   - [ ] Update table of contents when headings change
   - [ ] Validate heading hierarchy

3. **Editable List Blocks**
   - [ ] Add/remove list items
   - [ ] Convert between ordered/unordered lists
   - [ ] Nested list support

4. **Editable Code Blocks**
   - [ ] Syntax-highlighted code editor (use **CodeMirror 6**)
   - [ ] Language selector dropdown
   - [ ] Copy button preserved
   - [ ] Line numbers toggle

5. **Editable Callout Blocks**
   - [ ] Inline text editing
   - [ ] Callout type selector (info, warning, error, success)
   - [ ] Icon customization

6. **Image Block Management**
   - [ ] Upload new images
   - [ ] Edit alt text & captions
   - [ ] Replace existing images
   - [ ] Remove images
   - [ ] Image URL validation

7. **Edit Indicators**
   - [ ] Highlight edited blocks with subtle border/background
   - [ ] "Unsaved changes" indicator in header
   - [ ] Show change count badge

**Success Criteria**:
- ✅ Users can edit any text content inline
- ✅ Code blocks editable with syntax highlighting
- ✅ Images manageable (upload, edit, delete)
- ✅ Changes tracked in state
- ✅ All edits reversible

**Estimated Time**: 3-4 days

---

### **Phase 3: Section Management** 📂
**Goal**: Add, delete, reorder sections like a page builder

**Tasks**:
1. **Section Toolbar**
   - [ ] Floating toolbar on section hover
   - [ ] Actions: Move Up, Move Down, Delete, Duplicate
   - [ ] Keyboard shortcuts (Ctrl+Up, Ctrl+Down, Delete)

2. **Drag & Drop Reordering**
   - [ ] Implement **dnd-kit** for drag-and-drop
   - [ ] Visual drop zones between sections
   - [ ] Smooth animations during reorder
   - [ ] Mobile-friendly touch support

3. **Add New Section**
   - [ ] "Add Section" button between sections
   - [ ] Section template selector (Getting Started, Tutorial, FAQ, etc.)
   - [ ] Custom section option
   - [ ] Icon picker for new sections

4. **Delete Section**
   - [ ] Confirmation dialog before deletion
   - [ ] Soft delete (undo within session)
   - [ ] Remove from table of contents

5. **Duplicate Section**
   - [ ] Clone section with all content blocks
   - [ ] Auto-rename duplicated section (append " (Copy)")

6. **Section Collapse/Expand**
   - [ ] Collapsible sections for easier navigation
   - [ ] "Collapse All" / "Expand All" buttons
   - [ ] Preserve state in session

**Success Criteria**:
- ✅ Users can reorder sections via drag-and-drop
- ✅ New sections addable with templates
- ✅ Sections deletable with confirmation
- ✅ Smooth animations and visual feedback

**Estimated Time**: 2-3 days

---

### **Phase 4: Advanced Editing Features** ⚡
**Goal**: Power-user features for professional editing

**Tasks**:
1. **Undo/Redo System**
   - [ ] Implement history stack (last 50 actions)
   - [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
   - [ ] Undo/Redo buttons in toolbar
   - [ ] Show action description on hover

2. **Find & Replace**
   - [ ] Search across all sections (Ctrl+F)
   - [ ] Replace text globally
   - [ ] Case-sensitive toggle
   - [ ] Regex support (advanced)

3. **Content Block Toolbar**
   - [ ] "+" button to add blocks within sections
   - [ ] Block type selector (Paragraph, Heading, List, Code, Callout, Image)
   - [ ] Move block up/down within section
   - [ ] Delete block

4. **AI Assist (Optional Enhancement)**
   - [ ] "Improve this section" button (AI rewrites)
   - [ ] "Add code example" (AI generates code)
   - [ ] "Expand this" (AI adds more detail)
   - [ ] "Simplify this" (AI makes it clearer)

5. **Collaboration Indicators (Future)**
   - [ ] Show what's AI-generated vs user-edited
   - [ ] Highlight recently changed blocks
   - [ ] "Revert to AI version" option per block

**Success Criteria**:
- ✅ Undo/redo works reliably
- ✅ Find & replace functional
- ✅ Block-level toolbar for granular control
- ✅ (Optional) AI assist enhances editing experience

**Estimated Time**: 3-4 days

---

### **Phase 5: Save & Export Integration** 💾
**Goal**: Save edited docs and export with changes

**Tasks**:
1. **Save Draft Functionality**
   - [ ] "Save Draft" button in header
   - [ ] Auto-save every 30 seconds
   - [ ] Save to database (new `documentation_drafts` table)
   - [ ] Load draft on page refresh
   - [ ] "Unsaved changes" warning on navigation

2. **Export Edited Version**
   - [ ] Update export API to accept edited content
   - [ ] Merge AI-generated + user edits
   - [ ] Preserve formatting in all export formats (PDF, DOCX, HTML, Markdown)
   - [ ] "Export" button in preview column header

3. **Version Comparison**
   - [ ] Side-by-side view: AI version vs Edited version
   - [ ] Highlight differences (like GitHub diff)
   - [ ] "Revert all changes" option

4. **Edit History (Optional)**
   - [ ] Track editing sessions
   - [ ] Show "Last edited by [User] at [Time]"
   - [ ] Restore previous versions

**Success Criteria**:
- ✅ Edits saved automatically
- ✅ Export includes all user changes
- ✅ Drafts persist across sessions
- ✅ Version comparison helpful for reviewing changes

**Estimated Time**: 2-3 days

---

### **Phase 6: Polish & Testing** ✨
**Goal**: Production-ready quality

**Tasks**:
1. **Performance Optimization**
   - [ ] Virtualize long documents (render only visible sections)
   - [ ] Debounce auto-save (avoid excessive DB writes)
   - [ ] Lazy-load images
   - [ ] Code splitting for editor components

2. **Accessibility**
   - [ ] Keyboard navigation (Tab, Arrow keys)
   - [ ] Screen reader support (ARIA labels)
   - [ ] Focus indicators
   - [ ] High contrast mode compatibility

3. **Error Handling**
   - [ ] Graceful handling of save failures
   - [ ] Offline mode (edit locally, sync when online)
   - [ ] Conflict resolution if multiple users edit same doc

4. **User Testing**
   - [ ] Internal dogfooding (use it for our own docs)
   - [ ] Beta testing with 5-10 users
   - [ ] Collect feedback on UX pain points
   - [ ] Iterate based on feedback

5. **Documentation**
   - [ ] User guide for editor features
   - [ ] Keyboard shortcuts reference
   - [ ] Video tutorial (2-3 min walkthrough)

**Success Criteria**:
- ✅ Editor performs smoothly on large docs (100+ sections)
- ✅ Fully accessible (WCAG AA compliant)
- ✅ No critical bugs
- ✅ Users successfully edit and export docs

**Estimated Time**: 2-3 days

---

## 🛠️ Technology Stack Recommendations

### **Rich Text Editor**
- **Tiptap** (Recommended) - Modern, React-friendly, extensible
- Alternative: Lexical (Facebook), ProseMirror (lower-level)

### **Code Editor**
- **CodeMirror 6** - Modern, syntax highlighting, language support
- Alternative: Monaco Editor (VS Code's editor)

### **Drag & Drop**
- **dnd-kit** - Modern, accessible, React-friendly
- Alternative: react-beautiful-dnd (older but mature)

### **State Management**
- **Zustand** or **Jotai** (lightweight, simple)
- Alternative: Redux Toolkit (if complex state needed)

### **Undo/Redo**
- **Immer** - Immutable state updates (built into Zustand)
- Custom history stack with circular buffer

---

## 📊 Success Metrics

**User Engagement**:
- % of users who edit before export (target: 60%+)
- Average edits per session (target: 5-10)
- Time spent in editor (target: 5-10 minutes)

**Quality Improvement**:
- User satisfaction with edited docs (survey: 8+/10)
- Export rate after editing (target: 80%+)

**Technical Performance**:
- Editor load time < 1 second
- Auto-save < 500ms
- No lag on typing (60 FPS)

---

## 🚧 Potential Challenges & Mitigations

| Challenge | Mitigation |
|-----------|-----------|
| **Large docs slow down editor** | Virtualize rendering, lazy-load sections |
| **Rich text editor complexity** | Use battle-tested library (Tiptap), not custom |
| **Undo/redo state management** | Use Immer for immutable updates, circular buffer |
| **Export format preservation** | Test all formats (PDF, DOCX, HTML) thoroughly |
| **Mobile editing difficult** | Focus on desktop first, simplify mobile UI |
| **Concurrent editing conflicts** | Add optimistic locking, warn on conflicts |

---

## 📅 Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: Foundation** | 1-2 days | Read-only preview with state management |
| **Phase 2: Block Editing** | 3-4 days | Inline editing of all content blocks |
| **Phase 3: Section Management** | 2-3 days | Add, delete, reorder sections |
| **Phase 4: Advanced Features** | 3-4 days | Undo/redo, find/replace, AI assist |
| **Phase 5: Save & Export** | 2-3 days | Draft saving, export with edits |
| **Phase 6: Polish** | 2-3 days | Performance, accessibility, testing |
| **TOTAL** | **13-19 days** | Production-ready doc editor |

---

## 🎯 Next Steps

**Immediate Action (Phase 1)**:
1. ✅ Audit `GenerationProgress.tsx` preview column (lines 609-1299)
2. Create `<EditableDocViewer>` component
3. Set up state management with `useDocEditor` hook
4. Render AI-generated sections in preview
5. Add "Edit Mode" toggle (disabled until Phase 2)

**Let's Start!** 🚀
