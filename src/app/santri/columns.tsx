"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Santri, deleteSantri } from "./actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { EditSantriDialog } from "./EditSantriDialog"
import { useLanguage } from "@/contexts/LanguageContext"

export const columns: ColumnDef<Santri>[] = [
  {
    accessorKey: "nis",
    header: () => {
      const { t } = useLanguage();
      return <>{t("students.nis")}</>;
    }
  },
  {
    accessorKey: "nama",
    header: () => {
      const { t } = useLanguage();
      return <>{t("students.name")}</>;
    }
  },
  {
    accessorKey: "kelas",
    header: () => {
      const { t } = useLanguage();
      return <>{t("students.class")}</>;
    }
  },
  {
    accessorKey: "nama_wali",
    header: () => {
      const { t } = useLanguage();
      return <>{t("students.parent_name")}</>;
    }
  },
  {
    accessorKey: "no_wa",
    header: () => {
      const { t } = useLanguage();
      return <>{t("students.parent_wa")}</>;
    }
  },
  {
    accessorKey: "nominal_spp",
    header: () => {
      const { t } = useLanguage();
      return <>{t("students.bill")}</>;
    },
    cell: ({ row }) => {
      const amount = row.getValue("nominal_spp") as number;
      return amount ? `Rp ${amount.toLocaleString('id-ID')}` : 'Rp 0';
    }
  },
  {
    accessorKey: "status_bulan_ini",
    header: () => {
      const { t } = useLanguage();
      return <>{t("students.status")}</>;
    },
    cell: ({ row }) => {
      const { t } = useLanguage();
      const status = row.getValue("status_bulan_ini") as string;
      const isLunas = status === 'LUNAS';
      return (
        <div className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${isLunas ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {isLunas ? t("students.paid") : t("students.unpaid")}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const santri = row.original
      return (
        <div className="flex items-center justify-end">
          <EditSantriDialog santri={santri} />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={async () => {
              if (confirm(`Hapus santri ${santri.nama}?`)) {
                await deleteSantri(santri.id)
              }
            }}
            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
