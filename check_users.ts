import { db } from './src/db/index';
import { users } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function check() {
  const allUsers = await db.select().from(users);
  console.log('Users in DB:', allUsers);
}
check().catch(console.error);
