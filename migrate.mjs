import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log("Creating ai_settings...");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ai_settings (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      tenant_id text NOT NULL UNIQUE,
      nama_usaha text,
      sapaan_pelanggan text DEFAULT 'Kak',
      gaya_bahasa text DEFAULT 'Formal',
      aturan_khusus text,
      basa_basi text,
      created_at text DEFAULT CURRENT_TIMESTAMP,
      updated_at text DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Creating ai_knowledge_base...");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ai_knowledge_base (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      tenant_id text NOT NULL,
      sumber text NOT NULL,
      konten text NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log("Migration successful!");
}

migrate().catch(console.error);
