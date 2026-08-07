import { db } from './src/db';
import { pengaturan } from './src/db/schema';
import { inArray } from 'drizzle-orm';

async function main() {
  const keys = ['OWNER_WA', 'deepseek_key', 'limit_token'];
  const res = await db.select().from(pengaturan).where(inArray(pengaturan.kunci, keys));
  console.log(res);
}

main();
