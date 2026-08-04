"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function verifyLogin(email: string, firebaseUid: string) {
  try {
    const userList = await db.select().from(users).where(eq(users.email, email));
    
    if (userList.length > 0) {
      return { success: true, token: firebaseUid };
    }
    
    return { success: false, error: "Akun Google ini tidak terdaftar di sistem. Gunakan akun yang sama dengan saat pendaftaran." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
