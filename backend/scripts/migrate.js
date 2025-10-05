// scripts/migrate.ts
import { db } from '../src/services/database';
import dotenv from 'dotenv';

dotenv.config();

const migrationQueries = [
  // Create uploads table
  `
  CREATE TABLE IF NOT EXISTS uploads (
    id VARCHAR(50) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    country VARCHAR(10),
    erp VARCHAR(50),
    rows_parsed INTEGER,
    file_data JSONB,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
  )
  `,
  
  // Create reports table
  `
  CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    upload_id VARCHAR(50) REFERENCES uploads(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    scores_overall INTEGER,
    report_json JSONB,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
  )
  `,
  
  // Create indexes
  `
  CREATE INDEX IF NOT EXISTS idx_uploads_expires ON uploads(expires_at)
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_reports_expires ON reports(expires_at)
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_reports_upload_id ON reports(upload_id)
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC)
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC)
  `
];

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    for (let i = 0; i < migrationQueries.length; i++) {
      console.log(`Running migration ${i + 1}/${migrationQueries.length}...`);
      await db.query(migrationQueries[i]);
    }
    
    console.log('All migrations completed successfully!');
    
    // Verify tables exist
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('uploads', 'reports')
    `);
    
    console.log(`Created tables: ${tables.rows.map((row: any) => row.table_name).join(', ')}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.getPool().end();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };