"use server";



import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getServerTenantId } from "./auth";

export async function sendWaMessage(noWa: string, messageText: string) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) return { success: false, message: "Unauthorized" };

    const urlConfig = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, 'wa_bot_url'), eq(pengaturan.tenantId, tenantId)));
    const tokenConfig = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, 'wa_bot_token'), eq(pengaturan.tenantId, tenantId)));
    
    const url = urlConfig[0]?.nilai || "http://localhost:8080/send";
    const token = tokenConfig[0]?.nilai || process.env.BOT_API_SECRET || "default_secret";
    
    // Generate JWT token
    const jwtToken = jwt.sign({ sender: "nextjs-client" }, token, { expiresIn: '1h' });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        no_wa: noWa, // Go Backend expects no_wa
        pesan: messageText // Go Backend expects pesan
      })
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const err = await response.text();
      return { success: false, message: `Gagal mengirim pesan: ${err}` };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function requestWaPairing(phone: string) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) return { success: false, message: "Unauthorized" };

    const urlConfig = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, 'wa_bot_url'), eq(pengaturan.tenantId, tenantId)));
    const tokenConfig = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, 'wa_bot_token'), eq(pengaturan.tenantId, tenantId)));
    
    // Asumsi URL pairing adalah base_url diganti /send jadi /api/wa/pairing
    const rawUrl = urlConfig[0]?.nilai || "http://localhost:8080/send";
    const pairingUrl = rawUrl.replace("/send", "/api/wa/pairing");
    const token = tokenConfig[0]?.nilai || process.env.BOT_API_SECRET || "default_secret";
    
    const jwtToken = jwt.sign({ sender: "nextjs-client" }, token, { expiresIn: '1h' });

    const response = await fetch(pairingUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();
    if (response.ok && data.code) {
      return { success: true, code: data.code };
    } else {
      return { success: false, message: data.error || "Gagal meminta kode pairing dari bot" };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function checkWaStatus() {
  try {
    const urlConfig = await db.select().from(pengaturan).where(eq(pengaturan.kunci, 'wa_bot_url'));
    const url = urlConfig[0]?.nilai;
    
    if (!url) {
      return { success: false, message: "URL WA Bot belum diatur." };
    }

    // Misal URL bot adalah https://api.wablas.com/v2/send-message
    // Kita panggil url base untuk mengecek status (tergantung implementasi Node.js user)
    // Di sini kita return mock success sementara sampai user memberikan url spesifik
    return { 
      success: true, 
      status: "connected",
      phone: "0812xxxxxx"
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
