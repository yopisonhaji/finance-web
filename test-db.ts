import { createClient } from '@libsql/client'; 
const client = createClient({ url: 'file:C:/Users/yulis/Documents/Data_Keuangan_Pesantren/finance.db' }); 
async function test() { 
  await client.execute('PRAGMA journal_mode = WAL;'); 
  await client.execute('PRAGMA synchronous = NORMAL;'); 
  console.log('WAL Mode diaktifkan'); 
} 
test();
