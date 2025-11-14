import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function createMissingTables() {
  try {
    console.log('📦 Creating missing tables...');
    
    // Create battlecards table
    await sql`
      CREATE TABLE IF NOT EXISTS "battlecards" (
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
      )
    `;
    console.log('✅ Created battlecards table');
    
    // Create indexes for battlecards
    await sql`CREATE INDEX IF NOT EXISTS "battlecards_competitor_name_idx" ON "battlecards" ("competitor_name")`;
    await sql`CREATE INDEX IF NOT EXISTS "battlecards_status_idx" ON "battlecards" ("status")`;
    await sql`CREATE INDEX IF NOT EXISTS "battlecards_user_id_idx" ON "battlecards" ("user_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "battlecards_created_at_idx" ON "battlecards" ("created_at")`;
    console.log('✅ Created battlecards indexes');
    
    // Create custom_orders table
    await sql`
      CREATE TABLE IF NOT EXISTS "custom_orders" (
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
      )
    `;
    console.log('✅ Created custom_orders table');
    
    // Create discount_codes table
    await sql`
      CREATE TABLE IF NOT EXISTS "discount_codes" (
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
      )
    `;
    console.log('✅ Created discount_codes table');
    
    // Create documentation_drafts table
    await sql`
      CREATE TABLE IF NOT EXISTS "documentation_drafts" (
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
      )
    `;
    console.log('✅ Created documentation_drafts table');
    
    // Create documentation_edit_history table
    await sql`
      CREATE TABLE IF NOT EXISTS "documentation_edit_history" (
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
      )
    `;
    console.log('✅ Created documentation_edit_history table');
    
    console.log('\n✅ All missing tables created successfully!\n');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createMissingTables();
