import postgres from 'postgres';

// Check what DATABASE_URL the script uses
console.log('\n📌 Database Configuration:');
console.log(`PGHOST: ${process.env.PGHOST}`);
console.log(`PGDATABASE: ${process.env.PGDATABASE}`);
console.log(`Database URL pattern: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`);

// Connect and check which database we're actually in
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function checkConnection() {
  try {
    const result = await sql`SELECT current_database(), version()`;
    console.log(`\n✅ Connected to database: ${result[0].current_database}`);
    console.log(`Version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`);
    
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'battlecards'`;
    console.log(`\nBattlecards table exists: ${tables.length > 0 ? '✅ YES' : '❌ NO'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

checkConnection();
