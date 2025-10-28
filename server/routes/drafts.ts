/**
 * Phase 3: Documentation Drafts API
 * Endpoints for saving, loading, and publishing edited documentation
 */

import express from 'express';
import { db } from '../db';
import { documentationDrafts, documentationEditHistory, documentations } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySupabaseAuth } from '../middleware/auth';

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

    // Verify the documentation exists
    const docs = await db
      .select()
      .from(documentations)
      .where(eq(documentations.id, docId))
      .limit(1);

    if (docs.length === 0) {
      return res.status(404).json({ error: 'Documentation not found' });
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
      drafts = await db
        .select()
        .from(documentationDrafts)
        .where(eq(documentationDrafts.id, draftId))
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

    // Update the main documentation with the draft content
    const updated = await db
      .update(documentations)
      .set({
        title: draft.title,
        content: contentHtml,
      })
      .where(eq(documentations.id, docId))
      .returning();

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

export default router;
