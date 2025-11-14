import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function checkTables() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📊 Existing tables in database:');
    tables.forEach(t => console.log(`  ✓ ${t.table_name}`));
    console.log(`\n Total: ${tables.length} tables\n`);
    
    // Check specifically for battlecards table
    const hasBattlecards = tables.some(t => t.table_name === 'battlecards');
    const hasDocumentations = tables.some(t => t.table_name === 'documentations');
    
    console.log(`Battlecards table: ${hasBattlecards ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`Documentations table: ${hasDocumentations ? '✅ EXISTS' : '❌ MISSING'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkTables();
