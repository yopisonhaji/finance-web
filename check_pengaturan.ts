import { db } from './src/db/index';
import { pengaturan } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function check() {
  const allPengaturan = await db.select().from(pengaturan);
  console.log('Pengaturan in DB:', allPengaturan);
}
check().catch(console.error);
