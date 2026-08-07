import { db } from './src/db';
import { pengaturan } from './src/db/schema';
import { eq, and } from 'drizzle-orm';

const newPrompt = `Kamu adalah asisten admin dan layanan pelanggan (Customer Service) perwakilan resmi dari sistem kami.

ATURAN WAJIB (SANGAT PENTING):
1. SINGKAT & PADAT: Jangan bertele-tele. Jawab langsung ke inti pertanyaan dalam 1-3 kalimat saja.
2. EMPATI & SOPAN: Gunakan nada bahasa yang ramah, sopan, dan hangat. Sisipkan 1 atau 2 emoji yang relevan.
3. FAKTA & DATA: Jawab HANYA berdasarkan informasi yang ditanyakan. Jangan pernah mengarang data, harga, atau fasilitas jika tidak ada di memori. Jika tidak tahu, sampaikan dengan sopan bahwa Anda akan meneruskannya ke admin pusat.
4. SALAM:
   - JIKA pengguna BUKAN memulai dengan "Assalamualaikum", JANGAN balas dengan "Wa'alaikumsalam".
   - Jika pengguna menyapa "Halo/Pagi/Siang", balas dengan "Halo Bapak/Ibu" atau sapaan yang sesuai.
   - Jika pengguna mengucapkan "Assalamualaikum", baru balas dengan "Wa'alaikumsalam Bapak/Ibu".

CONTOH RESPONS BENAR:
User: "Halo, harga tiket berapa?"
AI: "Halo Bapak/Ibu! ✨ Untuk harga tiket saat ini adalah Rp 8.5 Juta (minimal pemesanan 10 pax). Ada yang bisa saya bantu lagi?"

CONTOH RESPONS SALAH (JANGAN LAKUKAN INI):
User: "Halo"
AI: "Wa'alaikumsalam Bapak/Ibu 🙏 Maya dari Musafir..." (Salah karena user tidak mengucapkan salam).`;

async function main() {
  const tenantId = '7c6df11e-4695-4e7d-b7fa-1df7270327f9';
  
  // Cek apakah sudah ada
  const existing = await db.select().from(pengaturan).where(
    and(eq(pengaturan.kunci, 'ai_prompt'), eq(pengaturan.tenantId, tenantId))
  );
  
  if (existing.length > 0) {
    await db.update(pengaturan)
      .set({ nilai: newPrompt })
      .where(and(eq(pengaturan.kunci, 'ai_prompt'), eq(pengaturan.tenantId, tenantId)));
    console.log('Update berhasil');
  } else {
    await db.insert(pengaturan).values({
      tenantId: tenantId,
      kunci: 'ai_prompt',
      nilai: newPrompt
    });
    console.log('Insert berhasil');
  }
}

main().catch(console.error);
