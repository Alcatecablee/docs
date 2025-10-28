-- Phase 3: Add documentation drafts and edit history tables
-- For real-time editing with save/publish and undo/redo functionality

-- Documentation drafts table
CREATE TABLE IF NOT EXISTS documentation_drafts (
  id SERIAL PRIMARY KEY,
  documentation_id INTEGER NOT NULL REFERENCES documentations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sections JSONB NOT NULL, -- Structured JSON with sections and content blocks
  metadata JSONB, -- Additional draft metadata
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  last_saved_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Documentation edit history table for undo/redo
CREATE TABLE IF NOT EXISTS documentation_edit_history (
  id SERIAL PRIMARY KEY,
  draft_id INTEGER NOT NULL REFERENCES documentation_drafts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'update_block', 'add_section', 'delete_section', 'update_section', etc.
  target_type TEXT NOT NULL, -- 'section', 'block', 'document'
  target_id TEXT, -- ID of the section or block being edited
  previous_state JSONB, -- Previous state for undo
  new_state JSONB, -- New state for redo
  change_description TEXT, -- Human-readable description
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documentation_drafts_doc_id ON documentation_drafts(documentation_id);
CREATE INDEX IF NOT EXISTS idx_documentation_drafts_user_id ON documentation_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_documentation_drafts_last_saved ON documentation_drafts(last_saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_edit_history_draft_id ON documentation_edit_history(draft_id);
CREATE INDEX IF NOT EXISTS idx_documentation_edit_history_created_at ON documentation_edit_history(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE documentation_drafts IS 'Stores draft versions of edited documentation for real-time editing';
COMMENT ON TABLE documentation_edit_history IS 'Tracks edit history for undo/redo functionality';
COMMENT ON COLUMN documentation_drafts.sections IS 'Structured JSON containing sections array with content blocks (paragraphs, headings, code, etc.)';
COMMENT ON COLUMN documentation_edit_history.previous_state IS 'Previous state before the edit, used for undo operations';
COMMENT ON COLUMN documentation_edit_history.new_state IS 'New state after the edit, used for redo operations';
