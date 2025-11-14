CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"organization_id" integer,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentation_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"page_url" text,
	"section_id" text,
	"user_id" integer,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentation_id" integer NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"total_exports" integer DEFAULT 0 NOT NULL,
	"total_searches" integer DEFAULT 0 NOT NULL,
	"avg_time_on_page" integer,
	"popular_pages" jsonb,
	"popular_sections" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"scopes" jsonb DEFAULT '["read", "write"]' NOT NULL,
	"rate_limit_per_minute" integer DEFAULT 60 NOT NULL,
	"rate_limit_per_day" integer DEFAULT 1000 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "battlecards" (
	"id" serial PRIMARY KEY NOT NULL,
	"competitor_name" text NOT NULL,
	"competitor_url" text,
	"user_id" integer,
	"request_hash" text,
	"payload" jsonb NOT NULL,
	"pdf_url" text,
	"pdf_size_bytes" integer,
	"quality_score" numeric(5, 2),
	"total_sources" integer DEFAULT 0 NOT NULL,
	"reddit_sources" integer DEFAULT 0 NOT NULL,
	"stackoverflow_sources" integer DEFAULT 0 NOT NULL,
	"github_sources" integer DEFAULT 0 NOT NULL,
	"youtube_sources" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "battlecards_request_hash_unique" UNIQUE("request_hash")
);
--> statement-breakpoint
CREATE TABLE "branding_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"organization_id" integer,
	"logo_url" text,
	"primary_color" text,
	"secondary_color" text,
	"font_family" text,
	"custom_css" text,
	"white_label_enabled" boolean DEFAULT false NOT NULL,
	"custom_domain" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"user_id" integer,
	"email" text NOT NULL,
	"url" text NOT NULL,
	"github_repo" text,
	"tier" text NOT NULL,
	"sections" text NOT NULL,
	"source_depth" text NOT NULL,
	"delivery" text NOT NULL,
	"formats" jsonb NOT NULL,
	"branding" text NOT NULL,
	"youtube_options" jsonb,
	"seo_options" jsonb,
	"enterprise_features" jsonb,
	"custom_requirements" text,
	"requirements_parsed" jsonb,
	"requirements_complexity_score" integer,
	"pricing_breakdown" jsonb NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"tax_amount" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"discount_code" text,
	"payment_id" text,
	"payment_status" text DEFAULT 'pending',
	"status" text DEFAULT 'quote',
	"fulfillment_status" text,
	"estimated_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"delivery_url" text,
	"ip_address" text,
	"user_agent" text,
	"referral_source" text,
	"session_data" jsonb,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"completed_at" timestamp,
	CONSTRAINT "custom_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_order_amount" numeric(10, 2),
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "documentation_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentation_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sections" jsonb NOT NULL,
	"metadata" jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"last_saved_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentation_edit_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"previous_state" jsonb,
	"new_state" jsonb,
	"change_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentation_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentation_id" integer NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"section_type" text,
	"metadata" jsonb,
	"search_vector" "tsvector",
	"last_checked_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentation_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentation_id" integer NOT NULL,
	"version" integer NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"user_id" integer,
	"theme_id" integer,
	"subdomain" text,
	"version_notes" text,
	"content_hash" text,
	"is_latest" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "documentations" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"user_id" integer,
	"subdomain" text,
	"theme_id" integer,
	"current_version" integer DEFAULT 1 NOT NULL,
	"search_vector" "tsvector",
	"deletion_scheduled_at" timestamp,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documentations_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"status" text NOT NULL,
	"status_code" integer,
	"response" text,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "idempotency_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"permissions" jsonb DEFAULT '[]' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"owner_id" integer NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "page_change_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"documentation_id" integer NOT NULL,
	"old_hash" text,
	"new_hash" text NOT NULL,
	"change_type" text NOT NULL,
	"diff_summary" text,
	"regenerated" boolean DEFAULT false NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_id" text,
	"payment_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text NOT NULL,
	"plan" text NOT NULL,
	"payment_type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_to" integer,
	"sla_deadline" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" integer NOT NULL,
	"tokens" jsonb NOT NULL,
	"is_default" text DEFAULT 'false',
	"source_url" text,
	"confidence_score" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"subscription_id" text,
	"subscription_status" text,
	"generation_count" integer DEFAULT 0 NOT NULL,
	"api_key" text,
	"api_usage" integer DEFAULT 0 NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0.00',
	"last_reset_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"webhook_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"response_status" integer,
	"response_body" text,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"organization_id" integer,
	"url" text NOT NULL,
	"events" jsonb DEFAULT '["documentation.created", "documentation.updated"]' NOT NULL,
	"secret" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_triggered_at" timestamp,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "battlecards_competitor_name_idx" ON "battlecards" USING btree ("competitor_name");--> statement-breakpoint
CREATE INDEX "battlecards_status_idx" ON "battlecards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "battlecards_user_id_idx" ON "battlecards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "battlecards_created_at_idx" ON "battlecards" USING btree ("created_at");