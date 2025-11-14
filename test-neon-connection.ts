import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function testConnection() {
  try {
    console.log('\n🔍 Testing Neon/Supabase connection...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const result = await pool.query('SELECT current_database()');
    console.log(`✅ Connected to database: ${result.rows[0].current_database}`);
    
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'battlecards'
    `);
    console.log(`Battlecards table: ${tables.rows.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
    
    await pool.end();
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
