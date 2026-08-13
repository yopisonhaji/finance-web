/**
 * SCRIPT IMPORT DATABASE — Restore SQL dump ke Turso
 * Digunakan saat restore setelah bencana
 * Cara pakai: node import-db.js <path-to-sql-file>
 */

const path = require('path');
const fs = require('fs');

// Load env dari berbagai kemungkinan lokasi
const envPaths = [
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env'),
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env'),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}

const { createClient } = require('@libsql/client');

const TURSO_URL   = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

const sqlFile = process.argv[2];

if (!sqlFile) {
  console.error('Cara pakai: node import-db.js <path-file-sql>');
  console.error('Contoh   : node import-db.js ../backups/restore/database/db_backup_*.sql');
  process.exit(1);
}

if (!fs.existsSync(sqlFile)) {
  console.error(`File tidak ditemukan: ${sqlFile}`);
  process.exit(1);
}

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('ERROR: TURSO_DATABASE_URL atau TURSO_AUTH_TOKEN tidak ada di .env.local');
  process.exit(1);
}

const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

// Baca file SQL, pisah per statement
function parseSQLStatements(content) {
  const statements = [];
  // Hilangkan komentar baris (-- ...)
  const lines = content.split('\n');
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip komentar dan baris kosong
    if (trimmed.startsWith('--') || trimmed === '') continue;

    current += ' ' + trimmed;

    // Jika baris berakhir dengan ;, statement selesai
    if (trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt.length > 1) statements.push(stmt);
      current = '';
    }
  }

  return statements;
}

async function main() {
  console.log('\n=== IMPORT DATABASE TURSO ===');
  console.log(`File SQL  : ${sqlFile}`);
  console.log(`Target DB : ${TURSO_URL}`);
  console.log('');

  const content = fs.readFileSync(sqlFile, 'utf8');
  const statements = parseSQLStatements(content);

  console.log(`Total statements ditemukan: ${statements.length}`);
  console.log('Mulai import...\n');

  let success = 0;
  let skipped = 0;
  let errors  = 0;

  for (const stmt of statements) {
    try {
      // Skip statement yang tidak perlu di Turso Cloud
      if (
        stmt.startsWith('PRAGMA') ||
        stmt.startsWith('BEGIN TRANSACTION') ||
        stmt.startsWith('COMMIT') ||
        stmt.startsWith('CREATE TABLE') // Tabel sudah ada via schema migrate
      ) {
        skipped++;
        continue;
      }

      await db.execute(stmt);
      success++;

      // Log setiap 10 baris agar tidak terlalu banyak output
      if (success % 10 === 0) {
        process.stdout.write(`  [${success} rows imported...]\r`);
      }
    } catch (err) {
      // Ignore duplicate key errors (idempotent)
      if (err.message && (
        err.message.includes('UNIQUE constraint') ||
        err.message.includes('already exists')
      )) {
        skipped++;
      } else {
        errors++;
        console.error(`  [ERROR] ${err.message.substring(0, 100)}`);
        console.error(`  Statement: ${stmt.substring(0, 80)}...`);
      }
    }
  }

  console.log('\n');
  console.log('=== HASIL IMPORT ===');
  console.log(`  Berhasil : ${success} statements`);
  console.log(`  Di-skip  : ${skipped} statements (PRAGMA / duplikat)`);
  console.log(`  Error    : ${errors} statements`);
  console.log('');

  if (errors === 0) {
    console.log('[OK] Import database selesai tanpa error!');
    console.log('     Semua data user, santri, pengaturan telah dipulihkan.');
  } else {
    console.log('[WARN] Import selesai dengan beberapa error. Periksa log di atas.');
  }

  process.exit(errors > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
