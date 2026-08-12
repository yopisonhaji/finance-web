import { NextResponse } from "next/server"
import { db } from "@/db"
import { pengaturan, media_ai } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerTenantId } from "@/server/auth"
import jwt from "jsonwebtoken"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

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

    // Cek apakah R2 sudah dikonfigurasi
    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket = process.env.R2_BUCKET_NAME;
    const r2PublicUrl = process.env.R2_PUBLIC_URL;

    // Tambahkan query parameter filename dari req
    const url = new URL(req.url)
    const filename = url.searchParams.get("filename") || `file_${Date.now()}`
    const contentType = url.searchParams.get("contentType") || "application/octet-stream"
    
    // Path file di S3: tenant_id/filename
    const objectKey = `${tenantId}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    if (r2AccountId && r2AccessKey && r2SecretKey && r2Bucket) {
      // Gunakan Cloudflare R2
      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKey,
          secretAccessKey: r2SecretKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: r2Bucket,
        Key: objectKey,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
      
      const publicUrl = r2PublicUrl 
        ? `${r2PublicUrl}/${objectKey}` 
        : `https://${r2AccountId}.r2.cloudflarestorage.com/${r2Bucket}/${objectKey}`;

      return NextResponse.json({ 
        uploadUrl: signedUrl,
        publicUrl: publicUrl,
        isR2: true,
        method: "PUT"
      })
    }

    // Fallback: Proxy the upload to Bot-Go (VPS)
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
      uploadUrl: botUploadUrl,
      isR2: false,
      method: "POST"
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
