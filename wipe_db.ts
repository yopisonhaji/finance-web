import { db } from "./src/db/index";
import { users, pengaturan, santri, transaksi } from "./src/db/schema";
import { sql } from "drizzle-orm";

async function wipeDatabase() {
  console.log("Memulai proses wipe database...");

  try {
    // Delete all rows from tables
    await db.delete(transaksi);
    console.log("- Data tabel 'transaksi' dihapus.");

    await db.delete(santri);
    console.log("- Data tabel 'santri' dihapus.");

    await db.delete(pengaturan);
    console.log("- Data tabel 'pengaturan' dihapus.");

    await db.delete(users);
    console.log("- Data tabel 'users' dihapus.");

    console.log("Berhasil menghapus semua data (Reset to 0)!");
  } catch (error) {
    console.error("Gagal menghapus data:", error);
  }
}

wipeDatabase();
