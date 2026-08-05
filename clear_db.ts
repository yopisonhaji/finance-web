import { db } from './src/db/index';
import { users, pengaturan, santri, transaksi } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function clearAll() {
  console.log('Clearing database...');
  await db.delete(transaksi).execute();
  await db.delete(santri).execute();
  await db.delete(users).execute();
  await db.delete(pengaturan).execute();
  console.log('Database cleared completely.');
}

clearAll().catch(console.error);
