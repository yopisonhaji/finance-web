import { NextResponse } from "next/server"
import { db } from "@/db"
import { media_ai, pengaturan } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerTenantId } from "@/server/auth"
import jwt from "jsonwebtoken"

export async function GET(req: Request) {
  try {
    const tenantId = await getServerTenantId()
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const list = await db.query.media_ai.findMany({
      where: eq(media_ai.tenantId, tenantId),
      orderBy: (media_ai, { desc }) => [desc(media_ai.createdAt)]
    })

    return NextResponse.json(list)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const tenantId = await getServerTenantId()
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Check media limit
    const existingMedia = await db.query.media_ai.findMany({
      where: eq(media_ai.tenantId, tenantId)
    })

    if (existingMedia.length >= 10) {
      return NextResponse.json({ error: "Maksimal 10 file media" }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const namaFile = formData.get("namaFile") as string
    const deskripsi = formData.get("deskripsi") as string
    const tipeMedia = formData.get("tipeMedia") as string

    if (!file || !namaFile || !deskripsi) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    // Proxy the upload to Bot-Go
    const urlConfig = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.kunci, 'wa_bot_url'), eq(pengaturan.tenantId, tenantId))
    })
    const tokenConfig = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.kunci, 'wa_bot_token'), eq(pengaturan.tenantId, tenantId))
    })

    let rawUrl = urlConfig?.nilai || "http://127.0.0.1:8080/api/wa/send"
    rawUrl = rawUrl.replace("localhost", "127.0.0.1")
    let botUploadUrl = "http://127.0.0.1:8080/upload-media"
    try {
      const parsed = new URL(rawUrl)
      botUploadUrl = `${parsed.protocol}//${parsed.host}/upload-media`
    } catch (e) {}

    const token = tokenConfig?.nilai || process.env.BOT_API_SECRET || "default_secret"
    const jwtToken = jwt.sign({ tenant_id: tenantId, sender: "nextjs-client" }, token, { expiresIn: '1h' })

    const botFormData = new FormData()
    botFormData.append("file", file)

    const botRes = await fetch(botUploadUrl, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
      body: botFormData
    })

    if (!botRes.ok) {
      const errText = await botRes.text()
      return NextResponse.json({ error: "Gagal upload ke VPS: " + errText }, { status: 500 })
    }

    const botData = await botRes.json()
    const publicURL = botData.url

    // Save to Next.js Database
    const inserted = await db.insert(media_ai).values({
      tenantId: tenantId,
      namaFile: namaFile,
      urlFile: publicURL,
      deskripsi: deskripsi,
      tipeMedia: tipeMedia,
    }).returning()

    return NextResponse.json({ success: true, data: inserted[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const tenantId = await getServerTenantId()
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const id = parseInt(url.searchParams.get("id") || "0")
    const filename = url.searchParams.get("filename") || ""

    if (!id || !filename) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    // Validate ownership
    const media = await db.query.media_ai.findFirst({
      where: and(eq(media_ai.id, id), eq(media_ai.tenantId, tenantId))
    })

    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Call Bot-Go to delete file
    const urlConfig = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.kunci, 'wa_bot_url'), eq(pengaturan.tenantId, tenantId))
    })
    const tokenConfig = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.kunci, 'wa_bot_token'), eq(pengaturan.tenantId, tenantId))
    })

    let rawUrl = urlConfig?.nilai || "http://127.0.0.1:8080/api/wa/send"
    rawUrl = rawUrl.replace("localhost", "127.0.0.1")
    let botDeleteUrl = "http://127.0.0.1:8080/delete-media"
    try {
      const parsed = new URL(rawUrl)
      botDeleteUrl = `${parsed.protocol}//${parsed.host}/delete-media`
    } catch (e) {}

    const token = tokenConfig?.nilai || process.env.BOT_API_SECRET || "default_secret"
    const jwtToken = jwt.sign({ tenant_id: tenantId, sender: "nextjs-client" }, token, { expiresIn: '1h' })

    const botRes = await fetch(botDeleteUrl, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filename })
    })

    // Even if botRes fails (e.g. file already deleted), we still delete from DB
    await db.delete(media_ai).where(eq(media_ai.id, id))

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
