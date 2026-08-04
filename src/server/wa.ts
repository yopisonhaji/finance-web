"use server";



import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function sendWaMessage(noWa: string, messageText: string) {
  try {
    const urlConfig = await db.select().from(pengaturan).where(eq(pengaturan.kunci, 'wa_bot_url'));
    const tokenConfig = await db.select().from(pengaturan).where(eq(pengaturan.kunci, 'wa_bot_token'));
    
    const url = urlConfig[0]?.nilai;
    const token = tokenConfig[0]?.nilai;
    
    if (!url || !token) {
      return { success: false, message: "Konfigurasi WA Bot (URL & Token) belum diatur di menu Pengaturan." };
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: noWa,
        message: messageText
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
