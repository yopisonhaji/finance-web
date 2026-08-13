/**
 * SCRIPT DUMP DATABASE TURSO → SQL FILE
 * Mengekspor semua tabel dan data ke format SQL INSERT
 * yang bisa dipulihkan kapan saja ke database baru
 */

const path = require('path');
const fs = require('fs');

// Coba load .env.local dari berbagai lokasi
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

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ ERROR: TURSO_DATABASE_URL atau TURSO_AUTH_TOKEN tidak ditemukan di .env.local');
  process.exit(1);
}

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

// Semua nama tabel sesuai schema.ts
const TABLES = [
  'users',
  'pengaturan',
  'santri',
  'transaksi',
  'media_ai',
  'pencairan',
  'social_connections',
  'meta_customers',
  'meta_messages',
];

function escapeValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'bigint') return val.toString();
  // Escape single quotes
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

async function dumpTable(tableName) {
  try {
    // Ambil semua baris
    const result = await db.execute(`SELECT * FROM ${tableName}`);
    
    if (result.rows.length === 0) {
      return `-- Tabel ${tableName}: kosong (0 baris)\n`;
    }

    const columns = result.columns;
    let sql = `-- ==========================================\n`;
    sql += `-- Tabel: ${tableName} (${result.rows.length} baris)\n`;
    sql += `-- ==========================================\n`;
    
    for (const row of result.rows) {
      const values = columns.map(col => escapeValue(row[col]));
      sql += `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    }
    
    return sql;
  } catch (err) {
    return `-- ⚠️ Gagal dump tabel ${tableName}: ${err.message}\n`;
  }
}

async function getTableSchema(tableName) {
  try {
    const result = await db.execute(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`
    );
    if (result.rows.length > 0 && result.rows[0].sql) {
      return `-- DDL untuk ${tableName}:\n${result.rows[0].sql};\n`;
    }
    return `-- DDL tidak ditemukan untuk ${tableName}\n`;
  } catch (err) {
    return '';
  }
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = process.argv[2] || '.';
  const outputFile = path.join(outputDir, `db_backup_${timestamp}.sql`);

  console.log(`\n🔄 Mengkoneksi ke Turso: ${TURSO_URL.split('@')[0]}...`);
  
  let fullDump = '';
  
  // Header
  fullDump += `-- ============================================================\n`;
  fullDump += `-- BACKUP DATABASE TURSO - SISTEM FINANCE PESANTREN\n`;
  fullDump += `-- Tanggal Backup: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n`;
  fullDump += `-- Database URL: ${TURSO_URL}\n`;
  fullDump += `-- ============================================================\n\n`;
  fullDump += `PRAGMA foreign_keys=OFF;\nBEGIN TRANSACTION;\n\n`;

  // Dump DDL (CREATE TABLE)
  fullDump += `-- ============================================================\n`;
  fullDump += `-- BAGIAN 1: STRUKTUR TABEL (DDL)\n`;
  fullDump += `-- ============================================================\n\n`;
  
  for (const table of TABLES) {
    const ddl = await getTableSchema(table);
    fullDump += ddl + '\n';
  }

  // Dump DATA
  fullDump += `\n-- ============================================================\n`;
  fullDump += `-- BAGIAN 2: DATA (INSERT)\n`;
  fullDump += `-- ============================================================\n\n`;

  let totalRows = 0;
  for (const table of TABLES) {
    console.log(`  📦 Dumping tabel: ${table}...`);
    const tableDump = await dumpTable(table);
    fullDump += tableDump + '\n';
    
    // Hitung baris
    const match = tableDump.match(/\((\d+) baris\)/);
    if (match) totalRows += parseInt(match[1]);
  }

  // Footer
  fullDump += `\nCOMMIT;\nPRAGMA foreign_keys=ON;\n`;
  fullDump += `\n-- ============================================================\n`;
  fullDump += `-- BACKUP SELESAI. Total baris: ${totalRows}\n`;
  fullDump += `-- ============================================================\n`;

  // Tulis ke file
  fs.writeFileSync(outputFile, fullDump, 'utf8');
  const fileSizeKB = (fs.statSync(outputFile).size / 1024).toFixed(1);
  
  console.log(`\n✅ Database berhasil di-dump!`);
  console.log(`   📄 File: ${outputFile}`);
  console.log(`   📊 Ukuran: ${fileSizeKB} KB`);
  console.log(`   🔢 Total baris data: ${totalRows}`);
  
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
