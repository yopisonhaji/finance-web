"use server";

import { cookies } from "next/headers";

export async function getServerTenantId() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  return token || null;
}
