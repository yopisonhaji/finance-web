"use server";



import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export async function getSettings() {
  try {
    const res = await fetch("http://127.0.0.1:8080/api/pengaturan", { cache: 'no-store' });
    const json = await res.json();
    if (json.status === "success" && json.data) {
      return json.data;
    }
    return {};
  } catch (error) {
    console.error("Gagal mengambil pengaturan dari API:", error);
    return {};
  }
}

export async function saveSettings(data: Record<string, string>) {
  try {
    const res = await fetch("http://127.0.0.1:8080/api/pengaturan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      revalidatePath('/', 'layout');
      return { success: true };
    }
    
    const errData = await res.json();
    return { success: false, message: errData.error || "Gagal simpan pengaturan API" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
