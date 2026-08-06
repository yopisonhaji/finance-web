"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "super_secret_default_key_change_in_production";

export async function verifyLogin(email: string, firebaseUid: string) {
  try {
    const userList = await db.select().from(users).where(eq(users.email, email));
    
    if (userList.length > 0) {
      const user = userList[0];
      const token = jwt.sign(
        { 
          tenant_id: user.tenantId,
          email: user.email,
          role: "ADMIN"
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      
      return { success: true, token };
    }
    
    return { success: false, error: "Akun Google ini tidak terdaftar di sistem. Gunakan akun yang sama dengan saat pendaftaran." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
