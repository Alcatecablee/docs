import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function fixDocumentationsTable() {
  try {
    console.log('🔧 Adding missing column to documentations table...');
    
    // Add the missing deletion_scheduled_at column
    await sql`
      ALTER TABLE documentations 
      ADD COLUMN IF NOT EXISTS deletion_scheduled_at timestamp
    `;
    console.log('✅ Added deletion_scheduled_at column');
    
    // Verify the column exists now
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'documentations' 
      AND column_name = 'deletion_scheduled_at'
    `;
    
    if (result.length > 0) {
      console.log('✅ Verified: deletion_scheduled_at column exists');
    } else {
      console.log('❌ Column still missing!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

fixDocumentationsTable();
