"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SantriTunggakan, tandaiLunas } from "./actions"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export const columns: ColumnDef<SantriTunggakan>[] = [
  {
    accessorKey: "nis",
    header: "NIS",
  },
  {
    accessorKey: "nama",
    header: "Nama Santri",
  },
  {
    accessorKey: "kelas",
    header: "Kelas",
  },
  {
    accessorKey: "nama_wali",
    header: "Nama Wali",
  },
  {
    accessorKey: "no_wa",
    header: "No. WA Wali",
  },
  {
    accessorKey: "nominal_spp",
    header: "Tagihan Bulanan",
    cell: ({ row }) => {
      const amount = row.getValue("nominal_spp") as number;
      return amount ? `Rp ${amount.toLocaleString('id-ID')}` : 'Rp 0';
    }
  },
  {
    id: "status",
    header: "Status SPP",
    cell: () => {
      return (
        <div className="px-2 py-1 rounded-full text-xs font-semibold inline-block bg-rose-100 text-rose-700">
          BELUM BAYAR
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const santri = row.original
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={async () => {
            if (confirm(`Tandai Lunas untuk santri ${santri.nama}?`)) {
              await tandaiLunas(santri.id)
            }
          }}
          className="text-emerald-500 hover:text-emerald-600 border-emerald-500/30 hover:bg-emerald-50"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Tandai Lunas
        </Button>
      )
    },
  },
]




