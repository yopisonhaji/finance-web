"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "super_secret_default_key_change_in_production";

export async function getServerTenantId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.tenant_id || null;
  } catch (error) {
    // If it's a legacy plain UUID (not a JWT), let's gracefully return it for backward compatibility
    if (token.length === 36 && token.includes("-")) {
      return token;
    }
    return null;
  }
}
