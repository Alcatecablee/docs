-- Add GDPR-compliant data retention columns
-- Migration: add_data_retention_columns.sql
-- Created: 2025-10-30
-- Purpose: Add deleted_at and deletion_scheduled_at columns for data retention policies

-- Add deleted_at column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add deletion_scheduled_at column to documentations table
ALTER TABLE documentations ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP;

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentations_deletion_scheduled ON documentations(deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.deleted_at IS 'GDPR: Timestamp when user requested account deletion. Account will be permanently deleted after 90-day grace period.';
COMMENT ON COLUMN documentations.deletion_scheduled_at IS 'GDPR: Scheduled deletion date for documentation. Set when user requests account deletion.';
