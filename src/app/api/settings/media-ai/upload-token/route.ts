import { NextResponse } from "next/server"
import { db } from "@/db"
import { pengaturan, media_ai } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerTenantId } from "@/server/auth"
import jwt from "jsonwebtoken"

export async function GET(req: Request) {
  try {
    const tenantId = await getServerTenantId()
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Cek kuota: maksimal 20MB total per tenant
    const existingMedia = await db.query.media_ai.findMany({
      where: eq(media_ai.tenantId, tenantId)
    })

    // Estimasi total: maksimal 50 file
    if (existingMedia.length >= 50) {
      return NextResponse.json({ error: "Kuota penyimpanan penuh (maksimal 50 file). Hapus beberapa file lama." }, { status: 400 })
    }

    const maxBytes = 20 * 1024 * 1024;
    const usedBytes = existingMedia.reduce((acc, m) => acc + (m.ukuranFile || 0), 0);
    
    if (usedBytes >= maxBytes) {
      return NextResponse.json({ error: "Kuota memori 20MB sudah penuh. Hapus file lama." }, { status: 400 })
    }

    // Proxy the upload to Bot-Go
    const urlConfig = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.kunci, 'wa_bot_url'), eq(pengaturan.tenantId, tenantId))
    })
    const tokenConfig = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.kunci, 'wa_bot_token'), eq(pengaturan.tenantId, tenantId))
    })

    let rawUrl = urlConfig?.nilai || "http://195.88.211.117:8080/api/wa/send"
    rawUrl = rawUrl.replace("localhost", "127.0.0.1")
    let botUploadUrl = "http://195.88.211.117:8080/upload-media"
    try {
      const parsed = new URL(rawUrl)
      botUploadUrl = `${parsed.protocol}//${parsed.host}/upload-media`
    } catch (e) {}

    const token = tokenConfig?.nilai || process.env.BOT_API_SECRET || "yopis_secure_jwt_secret_841bd5a4c9e82110c7104f4a382c"
    const jwtToken = jwt.sign({ tenant_id: tenantId, sender: "nextjs-client" }, token, { expiresIn: '1h' })

    return NextResponse.json({ 
      token: jwtToken,
      uploadUrl: botUploadUrl
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
