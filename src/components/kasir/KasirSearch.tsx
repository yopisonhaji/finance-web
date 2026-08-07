"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Santri } from "@/app/santri/actions"
import { Search, UserCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface KasirSearchProps {
  santriList: Santri[]
  onSelect: (santri: Santri) => void
}

export function KasirSearch({ santriList, onSelect }: KasirSearchProps) {
  const [query, setQuery] = useState("")
  const { t } = useLanguage()

  const filtered = santriList.filter((s) => 
    s.nama.toLowerCase().includes(query.toLowerCase()) || 
    s.nis.includes(query)
  )

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative">
        <Search className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder={t("pos.search_placeholder")} 
          className="ps-9 h-11 text-lg shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pe-2">
        {filtered.map((s) => (
          <Card 
            key={s.id} 
            className="cursor-pointer bg-white dark:bg-[#1e293b] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-[#334155] hover:border-orange-500 dark:border-blue-500 transition-all group"
            onClick={() => onSelect(s)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-orange-500 dark:bg-blue-500/20 p-2 rounded-full text-orange-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <UserCircle2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{s.nama}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">NIS: {s.nis} • {t("pos.class")}: {s.kelas}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            {t("pos.no_student")}
          </div>
        )}
      </div>
    </div>
  )
}




