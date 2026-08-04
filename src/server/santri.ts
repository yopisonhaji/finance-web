"use server";



import { db } from "@/db";
import { santri } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function getSantris() {
  try {
    const data = await db.select().from(santri).orderBy(santri.id);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function addSantri(input: {
  nis: string;
  nama: string;
  kelas: string;
  nama_wali: string;
  no_wa: string;
  saldo: number;
}) {
  try {
    await db.insert(santri).values({ ...input, tenantId: 'default' });
    
    
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateSantri(id: number, input: {
  nis: string;
  nama: string;
  kelas: string;
  nama_wali: string;
  no_wa: string;
  saldo: number;
}) {
  try {
    await db.update(santri).set(input).where(eq(santri.id, id));
    
    
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteSantri(id: number) {
  try {
    await db.delete(santri).where(eq(santri.id, id));
    
    
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
