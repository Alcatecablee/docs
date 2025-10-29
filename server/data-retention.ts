/**
 * Data Retention & Automated Cleanup
 * 
 * Implements GDPR-compliant data retention policies
 * See: COMPLIANCE.md for retention schedules
 * 
 * Status: Core implementation - requires cron scheduler setup
 */

import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Retention periods (in days)
 */
export const RETENTION_PERIODS = {
  USER_ACCOUNT_AFTER_DELETION: 90,
  GENERATED_DOCS_AFTER_USER_DELETION: 30,
  CRAWL_HISTORY: 60,
  API_LOGS: 90,
  ANALYTICS_ANONYMIZATION: 365,
  PAYMENT_RECORDS: 2555, // 7 years
  SUPPORT_TICKETS: 1095, // 3 years
} as const;

/**
 * Delete user accounts marked for deletion > 90 days ago
 * Implements GDPR Right to Erasure (Art. 17) with grace period
 */
export async function deleteExpiredAccounts(): Promise<{ deleted: number }> {
  if (!db) {
    console.warn('[Data Retention] Database not configured, skipping account deletion');
    return { deleted: 0 };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.USER_ACCOUNT_AFTER_DELETION);

    const result = await db.execute(sql`
      DELETE FROM users
      WHERE deleted_at IS NOT NULL
      AND deleted_at < ${cutoffDate}
      RETURNING id
    `);

    const deletedCount = Array.isArray(result) ? result.length : 0;
    console.log(`[Data Retention] Deleted ${deletedCount} expired user accounts`);

    return { deleted: deletedCount };
  } catch (error) {
    console.error('[Data Retention] Error deleting expired accounts:', error);
    throw error;
  }
}

/**
 * Delete crawl history older than retention period
 */
export async function deleteCrawlHistory(options: { olderThan: number }): Promise<{ deleted: number }> {
  if (!db) {
    console.warn('[Data Retention] Database not configured, skipping crawl history deletion');
    return { deleted: 0 };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - options.olderThan);

    // Note: This assumes a crawl_history table exists
    // Adjust based on actual schema
    const result = await db.execute(sql`
      DELETE FROM crawl_history
      WHERE created_at < ${cutoffDate}
      RETURNING id
    `);

    const deletedCount = Array.isArray(result) ? result.length : 0;
    console.log(`[Data Retention] Deleted ${deletedCount} crawl history records older than ${options.olderThan} days`);

    return { deleted: deletedCount };
  } catch (error) {
    // Table might not exist yet
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('[Data Retention] crawl_history table does not exist yet, skipping');
      return { deleted: 0 };
    }
    console.error('[Data Retention] Error deleting crawl history:', error);
    throw error;
  }
}

/**
 * Delete API logs older than retention period
 */
export async function deleteLogs(options: { olderThan: number }): Promise<{ deleted: number }> {
  if (!db) {
    console.warn('[Data Retention] Database not configured, skipping log deletion');
    return { deleted: 0 };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - options.olderThan);

    // Note: This assumes an api_logs table exists
    // Adjust based on actual schema
    const result = await db.execute(sql`
      DELETE FROM api_logs
      WHERE created_at < ${cutoffDate}
      RETURNING id
    `);

    const deletedCount = Array.isArray(result) ? result.length : 0;
    console.log(`[Data Retention] Deleted ${deletedCount} API log records older than ${options.olderThan} days`);

    return { deleted: deletedCount };
  } catch (error) {
    // Table might not exist yet
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('[Data Retention] api_logs table does not exist yet, skipping');
      return { deleted: 0 };
    }
    console.error('[Data Retention] Error deleting logs:', error);
    throw error;
  }
}

/**
 * Anonymize analytics data older than retention period
 * Removes PII while preserving aggregate statistics
 */
export async function anonymizeAnalytics(options: { olderThan: number }): Promise<{ anonymized: number }> {
  if (!db) {
    console.warn('[Data Retention] Database not configured, skipping analytics anonymization');
    return { anonymized: 0 };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - options.olderThan);

    // Note: This assumes an analytics_events table exists
    // Adjust based on actual schema
    const result = await db.execute(sql`
      UPDATE analytics_events
      SET user_id = NULL,
          ip_address = NULL,
          user_agent = 'anonymized'
      WHERE created_at < ${cutoffDate}
      AND user_id IS NOT NULL
      RETURNING id
    `);

    const anonymizedCount = Array.isArray(result) ? result.length : 0;
    console.log(`[Data Retention] Anonymized ${anonymizedCount} analytics records older than ${options.olderThan} days`);

    return { anonymized: anonymizedCount };
  } catch (error) {
    // Table might not exist yet
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('[Data Retention] analytics_events table does not exist yet, skipping');
      return { anonymized: 0 };
    }
    console.error('[Data Retention] Error anonymizing analytics:', error);
    throw error;
  }
}

/**
 * Mark user for deletion (GDPR Right to Erasure)
 * Immediate anonymization with 90-day grace period before permanent deletion
 */
export async function markUserForDeletion(userId: string): Promise<void> {
  if (!db) {
    throw new Error('[Data Retention] Database not configured, cannot mark user for deletion');
  }

  try {
    // Immediate anonymization
    await db.execute(sql`
      UPDATE users 
      SET email = CONCAT('deleted-', id, '@anonymized.local'),
          name = 'Deleted User',
          deleted_at = NOW()
      WHERE id = ${userId}
    `);

    // Mark dependent documentation for deletion (30-day grace period)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + RETENTION_PERIODS.GENERATED_DOCS_AFTER_USER_DELETION);

    await db.execute(sql`
      UPDATE documentations 
      SET deletion_scheduled_at = ${deletionDate}
      WHERE user_id = ${userId}
      AND deletion_scheduled_at IS NULL
    `);

    console.log(`[Data Retention] User ${userId} marked for deletion`);
  } catch (error) {
    console.error('[Data Retention] Error marking user for deletion:', error);
    throw error;
  }
}

/**
 * Main cleanup job - should be run daily via cron
 * 
 * Setup options:
 * 1. Node-cron: https://www.npmjs.com/package/node-cron
 * 2. BullMQ: Already in dependencies, use recurring jobs
 * 3. External cron (GitHub Actions, Cloudflare Cron Triggers)
 * 
 * Example with node-cron:
 * ```typescript
 * import cron from 'node-cron';
 * 
 * // Run daily at 2 AM UTC
 * cron.schedule('0 2 * * *', async () => {
 *   await runDailyCleanup();
 * });
 * ```
 */
export async function runDailyCleanup(): Promise<void> {
  console.log('[Data Retention] Starting daily cleanup job');
  const startTime = Date.now();

  try {
    // Delete expired accounts
    const accountsResult = await deleteExpiredAccounts();

    // Delete old crawl history
    const crawlResult = await deleteCrawlHistory({ 
      olderThan: RETENTION_PERIODS.CRAWL_HISTORY 
    });

    // Delete old API logs
    const logsResult = await deleteLogs({ 
      olderThan: RETENTION_PERIODS.API_LOGS 
    });

    // Anonymize old analytics
    const analyticsResult = await anonymizeAnalytics({ 
      olderThan: RETENTION_PERIODS.ANALYTICS_ANONYMIZATION 
    });

    const duration = Date.now() - startTime;

    console.log('[Data Retention] Daily cleanup completed', {
      duration: `${duration}ms`,
      accounts: accountsResult.deleted,
      crawlHistory: crawlResult.deleted,
      logs: logsResult.deleted,
      analytics: analyticsResult.anonymized,
    });
  } catch (error) {
    console.error('[Data Retention] Daily cleanup failed:', error);
    throw error;
  }
}

/**
 * Get retention status for a user
 * Useful for GDPR data access requests
 */
export async function getRetentionStatus(userId: string): Promise<{
  userDeletedAt: Date | null;
  permanentDeletionDate: Date | null;
  documentationsCount: number;
  documentationsDeletionDate: Date | null;
}> {
  if (!db) {
    throw new Error('[Data Retention] Database not configured, cannot get retention status');
  }

  const user = await db.execute(sql`
    SELECT deleted_at FROM users WHERE id = ${userId}
  `);

  const docs = await db.execute(sql`
    SELECT COUNT(*) as count, MIN(deletion_scheduled_at) as deletion_date
    FROM documentations 
    WHERE user_id = ${userId}
  `);

  const userData = Array.isArray(user) ? user[0] : null;
  const docsData = Array.isArray(docs) ? docs[0] : null;

  let permanentDeletionDate: Date | null = null;
  if (userData?.deleted_at) {
    const tempDate = new Date(userData.deleted_at);
    tempDate.setDate(
      tempDate.getDate() + RETENTION_PERIODS.USER_ACCOUNT_AFTER_DELETION
    );
    permanentDeletionDate = tempDate;
  }

  return {
    userDeletedAt: userData?.deleted_at || null,
    permanentDeletionDate,
    documentationsCount: docsData?.count || 0,
    documentationsDeletionDate: docsData?.deletion_date || null,
  };
}
