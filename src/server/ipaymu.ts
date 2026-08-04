"use server";



import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

function getTimestamp() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export async function generatePaymentLink(orderId: string, amount: number, customer: { name: string, phone: string }, method?: string, tenantId?: string) {
  try {
    if (!tenantId) return { success: false, message: "Error: Tenant ID is missing" };

    const vaConfig = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, 'ipaymu_va'), eq(pengaturan.tenantId, tenantId)));
    const apiKeyConfig = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, 'ipaymu_key'), eq(pengaturan.tenantId, tenantId)));
    
    const va = vaConfig[0]?.nilai;
    const apiKey = apiKeyConfig[0]?.nilai;
    
    if (!va || !apiKey) {
      return { success: false, message: "Konfigurasi iPaymu VA atau API Key belum diatur." };
    }
    
    let url = "https://my.ipaymu.com/api/v2/payment";
    
    const payload: any = {
      product: [`Tagihan SPP - ${customer.name}`],
      qty: ["1"],
      price: [amount.toString()],
      referenceId: orderId,
      buyerName: customer.name,
      buyerPhone: customer.phone,
      returnUrl: "https://satujalan.id/payment-success",
      notifyUrl: "https://satujalan.id/webhook-ipaymu",
      cancelUrl: "https://satujalan.id/payment-cancel"
    };

    if (method) {
      if (method === 'qris') {
        payload.paymentMethod = 'qris';
        payload.paymentChannel = 'qris';
      } else if (method === 'va') {
        payload.paymentMethod = 'va';
        payload.paymentChannel = 'bni'; // Default to BNI VA
      } else if (method === 'cstore') {
        payload.paymentMethod = 'cstore';
        payload.paymentChannel = 'indomaret';
      }
      url = "https://my.ipaymu.com/api/v2/payment/direct";
    }
    
    const bodyJson = JSON.stringify(payload);
    const sha256Body = crypto.createHash('sha256').update(bodyJson).digest('hex').toLowerCase();
    const stringToSign = `POST:${va}:${sha256Body}:${apiKey}`;
    const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex').toLowerCase();
    const timestamp = getTimestamp();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'va': va,
        'signature': signature,
        'timestamp': timestamp
      },
      body: bodyJson
    });
    
    const data = await response.json();
    
    if (data.Success || data.Status === 200) {
      if (method) {
        return { success: true, directData: data.Data };
      }
      return { success: true, url: data.Data.Url };
    } else {
      return { success: false, message: data.Message || "Gagal membuat link pembayaran." };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
