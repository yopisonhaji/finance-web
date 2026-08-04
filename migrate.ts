import fs from 'fs';
import path from 'path';
import { db } from './src/db/index';
import { pengaturan } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function migrate() {
  const configPath = path.join(process.cwd(), '..', 'config.json');
  if (!fs.existsSync(configPath)) {
    console.log("No config.json found");
    return;
  }
  const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  const mappings: Record<string, string> = {
    'ipaymu_va': 'ipaymu_va',
    'ipaymu_api_key': 'ipaymu_key',
    'deepseek_api_key': 'deepseek_key',
    'wa_bot_url': 'wa_bot_url',
    'wa_bot_token': 'wa_bot_token',
    'telegram_bot_token': 'telegram_bot_token',
    'license_buyer_name': 'OWNER_NAMA',
    'license_buyer_wa': 'OWNER_WA'
  };

  for (const [oldKey, newKey] of Object.entries(mappings)) {
    if (data[oldKey]) {
      const existing = await db.select().from(pengaturan).where(eq(pengaturan.kunci, newKey));
      if (existing.length > 0) {
        await db.update(pengaturan).set({ nilai: String(data[oldKey]) }).where(eq(pengaturan.kunci, newKey));
      } else {
        await db.insert(pengaturan).values({ kunci: newKey, nilai: String(data[oldKey]) });
      }
      console.log(`Migrated ${oldKey} to ${newKey}`);
    }
  }
  
  // Explicit lowercase insertion for telegram token to match frontend form
  if (data['telegram_bot_token']) {
    const existing = await db.select().from(pengaturan).where(eq(pengaturan.kunci, 'telegram_bot_token'));
    if (existing.length > 0) {
      await db.update(pengaturan).set({ nilai: String(data['telegram_bot_token']) }).where(eq(pengaturan.kunci, 'telegram_bot_token'));
    } else {
      await db.insert(pengaturan).values({ kunci: 'telegram_bot_token', nilai: String(data['telegram_bot_token']) });
    }
  }
  
  console.log("Migration complete!");
  process.exit(0);
}

migrate();
