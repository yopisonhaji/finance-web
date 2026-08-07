"use client"

import { Santri } from "./actions"
import { EditSantriDialog } from "./EditSantriDialog"

export function SantriMobileList({ data }: { data: Santri[] }) {
  if (data.length === 0) {
    return (
      <div className="md:hidden flex flex-col items-center justify-center py-10 text-slate-700">
        Belum ada data.
      </div>
    )
  }

  return (
    <div className="md:hidden flex flex-col gap-4">
      {data.map((santri) => (
        <div key={santri.id} className="bg-slate-50 dark:bg-[#1e293b] rounded-xl p-4 shadow-sm border border-slate-300 dark:border-slate-700 flex flex-col gap-3 relative overflow-hidden">
          {/* Blue glow accent on the left edge */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 dark:bg-blue-500"></div>
          
          <div className="flex justify-between items-start pl-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{santri.nama}</h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 font-medium mt-0.5">NIS: {santri.nis} • Kelas: {santri.kelas}</p>
            </div>
            <div>
              <EditSantriDialog santri={santri} />
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-white dark:bg-[#0f172a] p-3 rounded-lg pl-2 ml-2 mt-2 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-700">Tagihan Bulanan</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                Rp {santri.nominal_spp?.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-700">Nama Wali</p>
              <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{santri.nama_wali}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}




