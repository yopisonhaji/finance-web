import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.TURSO_DATABASE_URL) {
  console.warn('[Database] Peringatan: TURSO_DATABASE_URL belum diatur di .env.local');
}

const globalForDb = globalThis as unknown as {
  libsqlClient: ReturnType<typeof createClient> | undefined;
};

const client = globalForDb.libsqlClient ?? createClient({ 
  url: process.env.TURSO_DATABASE_URL || 'file:./finance.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Tidak perlu set PRAGMA untuk Serverless Turso (dikelola oleh platform)
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('file:')) {
  client.execute('PRAGMA journal_mode = WAL;');
  client.execute('PRAGMA synchronous = NORMAL;');
  client.execute('PRAGMA busy_timeout = 5000;');
}

if (process.env.NODE_ENV !== "production") {
  globalForDb.libsqlClient = client;
}

export const db = drizzle(client, { schema });
