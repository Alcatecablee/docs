/**
 * Phase 3: Documentation Drafts API
 * Endpoints for saving, loading, and publishing edited documentation
 */

import express from 'express';
import { db } from '../db';
import { documentationDrafts, documentationEditHistory, documentations } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySupabaseAuth } from '../middleware/auth';
import { convertDraftToExportFormat, draftSectionsToHTML, draftSectionsToMarkdown } from '../utils/draft-exporter';

const router = express.Router();

/**
 * GET /api/documentations/:id/draft
 * Get the latest draft for a documentation
 */
router.get('/api/documentations/:id/draft', verifySupabaseAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get the latest draft for this documentation and user
    const drafts = await db
      .select()
      .from(documentationDrafts)
      .where(
        and(
          eq(documentationDrafts.documentation_id, docId),
          eq(documentationDrafts.user_id, userId)
        )
      )
      .orderBy(desc(documentationDrafts.updated_at))
      .limit(1);

    if (drafts.length === 0) {
      return res.status(404).json({ 
        error: 'No draft found',
        message: 'No draft exists for this documentation. Create one first.'
      });
    }

    const draft = drafts[0];

    res.json({
      success: true,
      draft: {
        id: draft.id,
        documentationId: draft.documentation_id,
        title: draft.title,
        description: draft.description,
        sections: draft.sections,
        metadata: draft.metadata,
        isPublished: draft.is_published,
        lastSavedAt: draft.last_saved_at,
        createdAt: draft.created_at,
        updatedAt: draft.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error fetching draft:', error);
    res.status(500).json({
      error: 'Failed to fetch draft',
      message: error.message,
    });
  }
});

/**
 * POST /api/documentations/:id/draft
 * Save or update a draft for a documentation
 */
router.post('/api/documentations/:id/draft', verifySupabaseAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { title, description, sections, metadata } = req.body;

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!title || !sections) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Title and sections are required'
      });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // SECURITY: Verify the documentation exists AND user owns it
    const docs = await db
      .select()
      .from(documentations)
      .where(
        and(
          eq(documentations.id, docId),
          eq(documentations.user_id, userId)
        )
      )
      .limit(1);

    if (docs.length === 0) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Documentation not found or you do not have permission to access it'
      });
    }

    // Check if a draft already exists
    const existingDrafts = await db
      .select()
      .from(documentationDrafts)
      .where(
        and(
          eq(documentationDrafts.documentation_id, docId),
          eq(documentationDrafts.user_id, userId)
        )
      )
      .limit(1);

    let draft;
    const now = new Date();

    if (existingDrafts.length > 0) {
      // Update existing draft
      const updated = await db
        .update(documentationDrafts)
        .set({
          title,
          description,
          sections,
          metadata,
          last_saved_at: now,
          updated_at: now,
        })
        .where(eq(documentationDrafts.id, existingDrafts[0].id))
        .returning();

      draft = updated[0];
    } else {
      // Create new draft
      const inserted = await db
        .insert(documentationDrafts)
        .values({
          documentation_id: docId,
          user_id: userId,
          title,
          description,
          sections,
          metadata,
          is_published: false,
          last_saved_at: now,
          created_at: now,
          updated_at: now,
        })
        .returning();

      draft = inserted[0];
    }

    res.json({
      success: true,
      message: 'Draft saved successfully',
      draft: {
        id: draft.id,
        documentationId: draft.documentation_id,
        title: draft.title,
        description: draft.description,
        sections: draft.sections,
        metadata: draft.metadata,
        isPublished: draft.is_published,
        lastSavedAt: draft.last_saved_at,
        createdAt: draft.created_at,
        updatedAt: draft.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error saving draft:', error);
    res.status(500).json({
      error: 'Failed to save draft',
      message: error.message,
    });
  }
});

/**
 * POST /api/documentations/:id/publish
 * Publish a draft (merge it back to the main documentation)
 */
router.post('/api/documentations/:id/publish', verifySupabaseAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { draftId } = req.body;

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get the draft
    let drafts;
    if (draftId) {
      // SECURITY: Verify draft ownership when using draftId
      drafts = await db
        .select()
        .from(documentationDrafts)
        .where(
          and(
            eq(documentationDrafts.id, draftId),
            eq(documentationDrafts.documentation_id, docId),
            eq(documentationDrafts.user_id, userId)
          )
        )
        .limit(1);
    } else {
      // Get the latest draft for this user
      drafts = await db
        .select()
        .from(documentationDrafts)
        .where(
          and(
            eq(documentationDrafts.documentation_id, docId),
            eq(documentationDrafts.user_id, userId)
          )
        )
        .orderBy(desc(documentationDrafts.updated_at))
        .limit(1);
    }

    if (drafts.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const draft = drafts[0];

    // TODO: Convert the structured sections JSON back to HTML content
    // For now, we'll store a JSON stringified version
    const contentHtml = `<!-- Published from draft -->\n${JSON.stringify(draft.sections, null, 2)}`;

    // SECURITY: Update the main documentation with the draft content (verify ownership)
    const updated = await db
      .update(documentations)
      .set({
        title: draft.title,
        content: contentHtml,
      })
      .where(
        and(
          eq(documentations.id, docId),
          eq(documentations.user_id, userId)
        )
      )
      .returning();

    // Check if update was successful
    if (updated.length === 0) {
      return res.status(404).json({
        error: 'Documentation not found',
        message: 'The documentation may have been deleted or you no longer have access to it'
      });
    }

    // Mark the draft as published
    await db
      .update(documentationDrafts)
      .set({
        is_published: true,
        updated_at: new Date(),
      })
      .where(eq(documentationDrafts.id, draft.id));

    res.json({
      success: true,
      message: 'Draft published successfully',
      documentation: updated[0],
    });
  } catch (error: any) {
    console.error('Error publishing draft:', error);
    res.status(500).json({
      error: 'Failed to publish draft',
      message: error.message,
    });
  }
});

/**
 * POST /api/documentations/:id/draft/history
 * Add an entry to the edit history (for undo/redo)
 */
router.post('/api/documentations/:id/draft/history', verifySupabaseAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { draftId, actionType, targetType, targetId, previousState, newState, changeDescription } = req.body;

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!draftId || !actionType || !targetType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'draftId, actionType, and targetType are required'
      });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // SECURITY: Verify draft ownership
    const drafts = await db
      .select()
      .from(documentationDrafts)
      .where(
        and(
          eq(documentationDrafts.id, draftId),
          eq(documentationDrafts.documentation_id, docId),
          eq(documentationDrafts.user_id, userId)
        )
      )
      .limit(1);

    if (drafts.length === 0) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Draft not found or you do not have permission to modify it'
      });
    }

    // Add to edit history
    const inserted = await db
      .insert(documentationEditHistory)
      .values({
        draft_id: draftId,
        user_id: userId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        previous_state: previousState,
        new_state: newState,
        change_description: changeDescription,
        created_at: new Date(),
      })
      .returning();

    res.json({
      success: true,
      message: 'Edit history entry added',
      history: inserted[0],
    });
  } catch (error: any) {
    console.error('Error adding edit history:', error);
    res.status(500).json({
      error: 'Failed to add edit history',
      message: error.message,
    });
  }
});

/**
 * GET /api/documentations/:id/draft/history
 * Get edit history for a draft (for undo/redo)
 */
router.get('/api/documentations/:id/draft/history', verifySupabaseAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { draftId, limit = 50 } = req.query;

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!draftId) {
      return res.status(400).json({ error: 'draftId query parameter is required' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // SECURITY: Verify draft ownership
    const drafts = await db
      .select()
      .from(documentationDrafts)
      .where(
        and(
          eq(documentationDrafts.id, parseInt(draftId as string)),
          eq(documentationDrafts.documentation_id, docId),
          eq(documentationDrafts.user_id, userId)
        )
      )
      .limit(1);

    if (drafts.length === 0) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Draft not found or you do not have permission to access it'
      });
    }

    // Get edit history
    const history = await db
      .select()
      .from(documentationEditHistory)
      .where(eq(documentationEditHistory.draft_id, parseInt(draftId as string)))
      .orderBy(desc(documentationEditHistory.created_at))
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      total: history.length,
      history: history.map(h => ({
        id: h.id,
        actionType: h.action_type,
        targetType: h.target_type,
        targetId: h.target_id,
        previousState: h.previous_state,
        newState: h.new_state,
        changeDescription: h.change_description,
        createdAt: h.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching edit history:', error);
    res.status(500).json({
      error: 'Failed to fetch edit history',
      message: error.message,
    });
  }
});

/**
 * GET /api/documentations/:id/draft/export/json
 * Export draft as JSON
 */
router.get('/api/documentations/:id/draft/export/json', verifySupabaseAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get the latest draft
    const drafts = await db
      .select()
      .from(documentationDrafts)
      .where(
        and(
          eq(documentationDrafts.documentation_id, docId),
          eq(documentationDrafts.user_id, userId)
        )
      )
      .orderBy(desc(documentationDrafts.updated_at))
      .limit(1);

    if (drafts.length === 0) {
      return res.status(404).json({ error: 'No draft found' });
    }

    const draft = drafts[0];
    const exportData = convertDraftToExportFormat(draft);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${draft.title.replace(/[^a-z0-9]/gi, '_')}_draft.json"`);
    res.json(exportData);
  } catch (error: any) {
    console.error('Error exporting draft as JSON:', error);
    res.status(500).json({ error: 'Failed to export draft as JSON' });
  }
});

/**
 * GET /api/documentations/:id/draft/export/markdown
 * Export draft as Markdown
 */
router.get('/api/documentations/:id/draft/export/markdown', verifySupabaseAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get the latest draft
    const drafts = await db
      .select()
      .from(documentationDrafts)
      .where(
        and(
          eq(documentationDrafts.documentation_id, docId),
          eq(documentationDrafts.user_id, userId)
        )
      )
      .orderBy(desc(documentationDrafts.updated_at))
      .limit(1);

    if (drafts.length === 0) {
      return res.status(404).json({ error: 'No draft found' });
    }

    const draft = drafts[0];
    const exportData = convertDraftToExportFormat(draft);

    let markdown = `# ${exportData.title}\n\n`;
    if (exportData.description) {
      markdown += `${exportData.description}\n\n---\n\n`;
    }
    markdown += draftSectionsToMarkdown(exportData.sections);

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${draft.title.replace(/[^a-z0-9]/gi, '_')}_draft.md"`);
    res.send(markdown);
  } catch (error: any) {
    console.error('Error exporting draft as Markdown:', error);
    res.status(500).json({ error: 'Failed to export draft as Markdown' });
  }
});

/**
 * GET /api/documentations/:id/draft/export/html
 * Export draft as HTML
 */
router.get('/api/documentations/:id/draft/export/html', verifySupabaseAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get the latest draft
    const drafts = await db
      .select()
      .from(documentationDrafts)
      .where(
        and(
          eq(documentationDrafts.documentation_id, docId),
          eq(documentationDrafts.user_id, userId)
        )
      )
      .orderBy(desc(documentationDrafts.updated_at))
      .limit(1);

    if (drafts.length === 0) {
      return res.status(404).json({ error: 'No draft found' });
    }

    const draft = drafts[0];
    const exportData = convertDraftToExportFormat(draft);

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${exportData.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { color: #8B5CF6; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
    h2 { color: #6366F1; margin-top: 30px; }
    .section-icon { margin-right: 8px; }
    code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; }
    .callout { padding: 12px 16px; border-left: 4px solid; border-radius: 4px; margin: 16px 0; }
    .callout-info { background: #eff6ff; border-color: #3b82f6; }
    .callout-warning { background: #fefce8; border-color: #eab308; }
    .callout-error { background: #fef2f2; border-color: #ef4444; }
    .callout-success { background: #f0fdf4; border-color: #22c55e; }
    .callout-tip { background: #faf5ff; border-color: #a855f7; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
    figcaption { text-align: center; font-style: italic; color: #666; margin-top: 8px; }
    .anchor-link { text-decoration: none; color: #d1d5db; margin-left: 8px; opacity: 0; }
    h2:hover .anchor-link, h3:hover .anchor-link { opacity: 1; }
  </style>
</head>
<body>
  <h1>${exportData.title}</h1>
  ${exportData.description ? `<p>${exportData.description}</p>` : ''}
  ${draftSectionsToHTML(exportData.sections)}
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${draft.title.replace(/[^a-z0-9]/gi, '_')}_draft.html"`);
    res.send(html);
  } catch (error: any) {
    console.error('Error exporting draft as HTML:', error);
    res.status(500).json({ error: 'Failed to export draft as HTML' });
  }
});

export default router;
