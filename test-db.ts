
import { db } from './src/db';
import { santri } from './src/db/schema';
import { and, eq } from 'drizzle-orm';

async function run() {
  try {
    const studentData = await db.query.santri.findFirst({
      where: and(eq(santri.tenantId, 'test'), eq(santri.no_wa, '123'))
    });
    console.log('Success:', studentData);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();

