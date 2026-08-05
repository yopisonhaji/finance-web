import { db } from "./src/db";
import { users } from "./src/db/schema";
import * as crypto from "crypto";

async function main() {
  try {
    const newTenantId = crypto.randomUUID();
    const res = await db.insert(users).values({
      tenantId: newTenantId,
      email: "test_second_user@gmail.com",
      firebaseUid: "test_firebase_uid_123",
      namaSekolah: "Test School",
      role: "SUPER_ADMIN"
    });
    console.log("Insert success:", res);
  } catch (err) {
    console.error("Insert failed:", err);
  }
}
main();
