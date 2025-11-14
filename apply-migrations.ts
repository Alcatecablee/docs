import fs from 'fs';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
});

async function applyMigrations() {
  try {
    console.log('📦 Reading migration file...');
    const migrationSQL = fs.readFileSync('migrations/0002_far_raza.sql', 'utf-8');
    
    console.log('🚀 Applying migrations...');
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Migrations applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyMigrations();
