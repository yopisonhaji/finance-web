import { NextResponse } from "next/server"
import { db } from "@/db"
import { santri } from "@/db/schema"
import { getServerTenantId } from "@/server/auth"
import { eq, and } from "drizzle-orm"

export async function POST(req: Request) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json()

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected an array." },
        { status: 400 }
      )
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Empty array provided." },
        { status: 400 }
      )
    }

    const errors = [];

    for (const item of data) {
      try {
        if (!item.nis || !item.nama) {
          errors.push(`Baris dilewati: NIS atau Nama kosong.`);
          continue;
        }

        const existing = await db.select().from(santri).where(
          and(eq(santri.tenantId, tenantId), eq(santri.nis, String(item.nis)))
        );

        if (existing.length > 0) {
          await db.update(santri).set({
            nama: String(item.nama),
            kelas: item.kelas ? String(item.kelas) : null,
            nama_wali: item.nama_wali ? String(item.nama_wali) : null,
            no_wa: item.no_wa ? String(item.no_wa) : null,
            saldo: item.saldo ? parseInt(item.saldo, 10) : 0,
            status_bulan_ini: item.status_bulan_ini ? String(item.status_bulan_ini) : "BELUM_BAYAR",
            updatedAt: new Date().toISOString()
          }).where(
            and(eq(santri.tenantId, tenantId), eq(santri.nis, String(item.nis)))
          );
        } else {
          await db.insert(santri).values({
            tenantId: tenantId,
            nis: String(item.nis),
            nama: String(item.nama),
            kelas: item.kelas ? String(item.kelas) : null,
            nama_wali: item.nama_wali ? String(item.nama_wali) : null,
            no_wa: item.no_wa ? String(item.no_wa) : null,
            saldo: item.saldo ? parseInt(item.saldo, 10) : 0,
            status_bulan_ini: item.status_bulan_ini ? String(item.status_bulan_ini) : "BELUM_BAYAR",
          });
        }
      } catch (e: any) {
        errors.push(`Error NIS ${item.nis}: ${e.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Data berhasil di-import/diperbarui.",
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error("[BATCH_IMPORT_ERROR]", error)
    return NextResponse.json(
      { error: "Gagal memproses batch import." },
      { status: 500 }
    )
  }
}
