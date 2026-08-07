"use client"

import { useState, useEffect } from "react"
import { KasirSearch } from "@/components/kasir/KasirSearch"
import { PaymentPanel } from "@/components/kasir/PaymentPanel"
import { TranslatedText } from "@/components/TranslatedText"
import { getSantri, Santri } from "@/app/santri/actions"

export default function KasirPage() {
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null)

  useEffect(() => {
    // Memuat data santri dari server action (saat ini mock data)
    async function loadData() {
      const data = await getSantri()
      setSantriList(data)
    }
    loadData()
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white"><TranslatedText tKey="pos.title" /></h1>
        <p className="text-slate-700 dark:text-slate-300 font-medium mt-1"><TranslatedText tKey="pos.subtitle" /></p>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Kiri: Pencarian Santri (Lebar 5 dari 12 kolom) */}
        <div className="lg:col-span-5 h-full overflow-hidden flex flex-col bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl p-4">
          <KasirSearch 
            santriList={santriList} 
            onSelect={(santri) => setSelectedSantri(santri)} 
          />
        </div>

        {/* Kanan: Panel Pembayaran (Lebar 7 dari 12 kolom) */}
        <div className="lg:col-span-7 h-full overflow-hidden bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl">
          <PaymentPanel santri={selectedSantri} />
        </div>
      </div>
    </div>
  )
}




