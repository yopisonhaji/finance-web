"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useQuery } from "@tanstack/react-query"
import { TranslatedText } from "@/components/TranslatedText"
import { Skeleton } from "@/components/ui/skeleton"

const KasirSearch = dynamic(() => import("@/components/kasir/KasirSearch").then(m => ({ default: m.KasirSearch })), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-xl" />
})

const PaymentPanel = dynamic(() => import("@/components/kasir/PaymentPanel").then(m => ({ default: m.PaymentPanel })), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-xl" />
})
import { getSantri, Santri } from "@/app/santri/actions"

export default function KasirPage() {
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null)

  const { data: santriList = [] } = useQuery({
    queryKey: ['santriList'],
    queryFn: () => getSantri(),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  })

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




