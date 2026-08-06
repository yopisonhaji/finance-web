"use client"

import { Input } from "@/components/ui/input"
import { Search, Loader2, User, Wallet } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
  saldo: number;
}

export function HeaderSearch() {
  const { t } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults([])
        return
      }
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.success) {
          setResults(data.data)
        }
      } catch (error) {
        console.error(error)
      }
      setIsLoading(false)
    }

    const timer = setTimeout(fetchResults, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (nis: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/pos?q=${nis}`)
  }

  return (
    <div ref={wrapperRef} className="flex-1 max-w-md ml-8 relative hidden md:block group">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
      </div>
      <Input 
        placeholder={t("search.placeholder") || "Cari santri..."}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => { if (query.length >= 2) setIsOpen(true) }}
        className="w-full bg-[#151c2c] border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 placeholder:text-slate-500 pl-10 pr-12 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all shadow-inner"
      />
      <div className="absolute inset-y-0 right-3 flex items-center">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-slate-500 dark:text-slate-400 animate-spin" />
        ) : (
          <div className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 border border-slate-300 dark:border-slate-700/50">
            <kbd className="font-sans">⌘</kbd> <kbd className="font-sans">K</kbd>
          </div>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 uppercase tracking-wider">Hasil Pencarian</div>
          
          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">Tidak ada santri ditemukan.</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((santri) => (
                <li key={santri.id}>
                  <button
                    onClick={() => handleSelect(santri.nis)}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-100 dark:bg-slate-800/80 flex items-start gap-3 transition-colors border-b border-slate-200 dark:border-slate-800/50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <User className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{santri.nama}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-300 dark:border-slate-700">{santri.kelas}</span>
                        <span>NIS: {santri.nis}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                        <Wallet className="w-3 h-3" /> Saldo
                      </div>
                      <div className="text-sm font-medium text-emerald-400">Rp {santri.saldo.toLocaleString("id-ID")}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
