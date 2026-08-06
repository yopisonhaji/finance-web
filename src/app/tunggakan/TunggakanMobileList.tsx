"use client"

import { SantriTunggakan, tandaiLunas } from "./actions"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function TunggakanMobileList({ data }: { data: SantriTunggakan[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const handleLunas = async (id: number) => {
    if (!confirm("Tandai lunas manual? (Pastikan uang sudah diterima)")) return
    setLoadingId(id)
    await tandaiLunas(id)
    setLoadingId(null)
    router.refresh()
  }

  if (data.length === 0) {
    return (
      <div className="md:hidden flex flex-col items-center justify-center py-10 text-slate-500">
        <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-4" />
        <p>Semua tagihan bulan ini sudah lunas!</p>
      </div>
    )
  }

  return (
    <div className="md:hidden flex flex-col gap-4">
      {data.map((santri) => (
        <div key={santri.id} className="bg-[#1e293b] rounded-xl p-4 shadow-sm border border-slate-300 dark:border-slate-700 flex flex-col gap-3 relative overflow-hidden">
          {/* Red glow accent on the left edge for arrears */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
          
          <div className="flex justify-between items-start pl-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{santri.nama}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">NIS: {santri.nis} • Kelas: {santri.kelas}</p>
            </div>
            <div className="bg-rose-500/10 text-rose-500 text-xs font-bold px-2 py-1 rounded border border-rose-500/20 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Menunggak
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-white dark:bg-[#0f172a] p-3 rounded-lg pl-2 ml-2 mt-2 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-500">Tagihan Bulan Ini</p>
              <p className="font-bold text-rose-400 text-lg">
                Rp {santri.nominal_spp?.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="pl-2 mt-2">
            <Button 
              onClick={() => handleLunas(santri.id)}
              disabled={loadingId === santri.id}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-900/20"
            >
              {loadingId === santri.id ? "Memproses..." : "Tandai Lunas Manual"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
