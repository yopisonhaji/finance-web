import { NextResponse } from "next/server";
import { db } from "@/db";
import { santri } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { processAIResponse } from "@/server/ai";

export async function POST(req: Request) {
  try {
    const { tenant_id, no_wa, pesan, message_type, is_new_conversation, push_name } = await req.json();

    if (!tenant_id || !no_wa || !pesan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ambil data santri
    const studentData = await db.query.santri.findFirst({
      where: and(eq(santri.tenantId, tenant_id), eq(santri.no_wa, no_wa))
    });

    const aiResult = await processAIResponse(pesan, no_wa, studentData || null, tenant_id, message_type || "", is_new_conversation || "true", push_name || "");

    return NextResponse.json({ 
      reply: aiResult.text,
      broadcasts: aiResult.broadcasts,
      media_url: aiResult.media_url,
      media_type: aiResult.media_type
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ reply: "Maaf, terjadi kesalahan internal sistem." });
  }
}


