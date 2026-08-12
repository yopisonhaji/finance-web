import { NextResponse } from "next/server"
import { db } from "@/db"
import { media_ai, pengaturan } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerTenantId } from "@/server/auth"
import jwt from "jsonwebtoken"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

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

    // Check kuota: maksimal 20MB total per tenant
    const existingMedia = await db.query.media_ai.findMany({
      where: eq(media_ai.tenantId, tenantId)
    })

    // Estimasi total: maksimal 50 file
    if (existingMedia.length >= 50) {
      return NextResponse.json({ error: "Kuota penyimpanan penuh (maksimal 50 file / 20MB total). Hapus beberapa file lama." }, { status: 400 })
    }

    const contentType = req.headers.get("content-type") || "";
    
    // Alur Baru: Bypass Vercel, Simpan JSON (Direct Upload dari Client)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { namaFile, deskripsi, urlFile, ukuranFile, tipeMedia } = body;
      
      if (!namaFile || !urlFile) {
        return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
      }

      const inserted = await db.insert(media_ai).values({
        tenantId: tenantId,
        namaFile: namaFile,
        urlFile: urlFile,
        deskripsi: deskripsi || "",
        ukuranFile: ukuranFile || 0,
        tipeMedia: tipeMedia || "document",
      }).returning()

      return NextResponse.json({ success: true, data: inserted[0] })
    }

    // Alur Lama (Bisa menyebabkan error 413 Payload Too Large di Vercel jika >4.5MB)
    const formData = await req.formData()
    const file = formData.get("file") as File
    const namaFile = formData.get("namaFile") as string
    const deskripsi = formData.get("deskripsi") as string
    const tipeMedia = formData.get("tipeMedia") as string

    if (!file || !namaFile || !deskripsi) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024   // 20 MB per file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 20MB per file" }, { status: 400 })
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
      ukuranFile: file.size,
      tipeMedia: tipeMedia,
    }).returning()

    return NextResponse.json({ success: true, data: inserted[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const tenantId = await getServerTenantId()
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { id, namaFile, deskripsi } = body

    if (!id || !namaFile) {
      return NextResponse.json({ error: "ID dan namaFile wajib diisi" }, { status: 400 })
    }

    // Validate ownership
    const media = await db.query.media_ai.findFirst({
      where: and(eq(media_ai.id, id), eq(media_ai.tenantId, tenantId))
    })

    if (!media) {
      return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 })
    }

    await db.update(media_ai)
      .set({ namaFile, deskripsi: deskripsi || media.deskripsi })
      .where(eq(media_ai.id, id))

    return NextResponse.json({ success: true, message: "Media berhasil diupdate" })
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

    // Cek apakah menggunakan R2
    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket = process.env.R2_BUCKET_NAME;

    if (r2AccountId && r2AccessKey && r2SecretKey && r2Bucket && media.urlFile.includes("r2.cloudflarestorage.com") || media.urlFile.includes("r2.dev")) {
      // Hapus dari R2
      try {
        const S3 = new S3Client({
          region: "auto",
          endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
          forcePathStyle: true,
          credentials: {
            accessKeyId: r2AccessKey as string,
            secretAccessKey: r2SecretKey as string,
          },
        });
        
        // Ekstrak objectKey dari URL
        // Contoh URL: https://pub-xxxx.r2.dev/tenantId/123_file.jpg
        let objectKey = filename;
        try {
          const urlObj = new URL(media.urlFile);
          objectKey = urlObj.pathname.substring(1); // remove leading slash
        } catch (e) {
           // fallback: if public url is not standard, try to find tenantId in the string
           const parts = media.urlFile.split(`${tenantId}/`);
           if (parts.length > 1) {
             objectKey = `${tenantId}/${parts[1]}`;
           }
        }

        const command = new DeleteObjectCommand({
          Bucket: r2Bucket,
          Key: objectKey,
        });

        await S3.send(command);
      } catch (err) {
        console.error("Gagal menghapus dari R2:", err);
      }
    } else {
      // Call Bot-Go to delete file (Alur Lama)
      const urlConfig = await db.query.pengaturan.findFirst({
        where: and(eq(pengaturan.kunci, 'wa_bot_url'), eq(pengaturan.tenantId, tenantId))
      })
      const tokenConfig = await db.query.pengaturan.findFirst({
        where: and(eq(pengaturan.kunci, 'wa_bot_token'), eq(pengaturan.tenantId, tenantId))
      })

      let rawUrl = urlConfig?.nilai || "http://195.88.211.117:8080/api/wa/send"
      rawUrl = rawUrl.replace("localhost", "127.0.0.1")
      let botDeleteUrl = "http://195.88.211.117:8080/delete-media"
      try {
        const parsed = new URL(rawUrl)
        botDeleteUrl = `${parsed.protocol}//${parsed.host}/delete-media`
      } catch (e) {}

      const token = tokenConfig?.nilai || process.env.BOT_API_SECRET || "yopis_secure_jwt_secret_841bd5a4c9e82110c7104f4a382c"
      const jwtToken = jwt.sign({ tenant_id: tenantId, sender: "nextjs-client" }, token, { expiresIn: '1h' })

      await fetch(botDeleteUrl, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      }).catch(() => {})
    }

    // Delete from DB
    await db.delete(media_ai).where(eq(media_ai.id, id))

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
