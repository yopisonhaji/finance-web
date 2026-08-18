import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ai_settings, ai_knowledge_base } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function extractTextFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) return '';
    const html = await response.text();
    const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    return text.substring(0, 5000); 
  } catch (e) {
    console.error("Gagal ekstrak URL", e);
    return '';
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, namaUsaha, sapaanPelanggan, gayaBahasa, aturanKhusus, basaBasi, knowledgeUrl } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const existing = await db.select().from(ai_settings).where(eq(ai_settings.tenantId, tenantId)).get();
    
    if (existing) {
      await db.update(ai_settings).set({
        namaUsaha,
        sapaanPelanggan,
        gayaBahasa,
        aturanKhusus,
        basaBasi: JSON.stringify(basaBasi || {}),
        updatedAt: new Date().toISOString()
      }).where(eq(ai_settings.tenantId, tenantId)).run();
    } else {
      await db.insert(ai_settings).values({
        tenantId,
        namaUsaha,
        sapaanPelanggan,
        gayaBahasa,
        aturanKhusus,
        basaBasi: JSON.stringify(basaBasi || {})
      }).run();
    }

    if (knowledgeUrl) {
      let scrapedText = await extractTextFromURL(knowledgeUrl);
      if (!scrapedText) {
        scrapedText = "Tidak dapat membaca isi tautan secara otomatis. Referensi: " + knowledgeUrl;
      }
      
      const existingKb = await db.select().from(ai_knowledge_base)
        .where(eq(ai_knowledge_base.tenantId, tenantId)).get();
      
      if (existingKb) {
        await db.update(ai_knowledge_base).set({
          sumber: knowledgeUrl,
          konten: scrapedText
        }).where(eq(ai_knowledge_base.tenantId, tenantId)).run();
      } else {
        await db.insert(ai_knowledge_base).values({
          tenantId,
          sumber: knowledgeUrl,
          konten: scrapedText
        }).run();
      }
    }
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving AI settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const settings = await db.select().from(ai_settings).where(eq(ai_settings.tenantId, tenantId)).get();
    const kb = await db.select().from(ai_knowledge_base).where(eq(ai_knowledge_base.tenantId, tenantId)).get();

    return NextResponse.json({
      settings: settings || null,
      knowledgeBase: kb || null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
