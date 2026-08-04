"use server";



import { db } from "@/db";
import { santri, transaksi } from "@/db/schema";
import { eq, desc } from "drizzle-orm";


export type Santri = {
  id: number;
  nis: string;
  nama: string;
  kelas: string | null;
  nama_wali: string | null;
  no_wa: string | null;
  saldo: number | null;
  nominal_spp: number | null;
  status_bulan_ini: string | null;
};

export async function getSantri() {
  try {
    const res = await fetch("http://127.0.0.1:8080/api/santri", { cache: 'no-store' });
    const json = await res.json();
    if (json.status === "success" && json.data) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.error("Gagal mengambil data santri dari API:", error);
    return [];
  }
}

export async function addSantri(data: {
  nis: string;
  nama: string;
  kelas: string;
  nama_wali: string;
  no_wa: string;
  nominal_spp?: number;
}) {
  try {
    const res = await fetch("http://127.0.0.1:8080/api/santri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      return { success: true };
    }
    
    const errData = await res.json();
    return { success: false, message: errData.error || "Gagal menambah santri API" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateSantri(id: number, data: {
  nis: string;
  nama: string;
  kelas: string;
  nama_wali: string;
  no_wa: string;
  nominal_spp?: number;
}) {
  try {
    const res = await fetch(`http://127.0.0.1:8080/api/santri/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      return { success: true };
    }
    
    const errData = await res.json();
    return { success: false, message: errData.error || "Gagal update santri API" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteSantri(id: number) {
  try {
    const res = await fetch(`http://127.0.0.1:8080/api/santri/${id}`, {
      method: "DELETE"
    });
    
    if (res.ok) {
      return { success: true };
    }
    
    const errData = await res.json();
    return { success: false, message: errData.error || "Gagal hapus santri API" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
