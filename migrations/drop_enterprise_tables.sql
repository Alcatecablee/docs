-- Migration to remove enterprise user-facing features
-- Keeps all infrastructure tables (monitoring, audit, analytics, etc.)

-- Drop enterprise feature tables
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS subscription_events CASCADE;
DROP TABLE IF EXISTS custom_orders CASCADE;
DROP TABLE IF EXISTS discount_codes CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS webhook_deliveries CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS support_ticket_messages CASCADE;
DROP TABLE IF EXISTS branding_settings CASCADE;

-- Simplify users table - remove billing/subscription fields
ALTER TABLE users DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_status;
ALTER TABLE users DROP COLUMN IF EXISTS api_key;
ALTER TABLE users DROP COLUMN IF EXISTS api_usage;
ALTER TABLE users DROP COLUMN IF EXISTS balance;
ALTER TABLE users DROP COLUMN IF EXISTS generation_count;
ALTER TABLE users DROP COLUMN IF EXISTS last_reset_at;

-- Note: Keep plan field for basic tier distinction (free/pro)
-- Keep deleted_at for GDPR compliance
-- Keep is_admin for admin access
