"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Language } from "@/lib/translations"

const languageOptions: { code: Language; label: string; flagUrl: string }[] = [
  { code: "id", label: "Indonesia", flagUrl: "https://flagcdn.com/id.svg" },
  { code: "en", label: "English", flagUrl: "https://flagcdn.com/gb.svg" },
  { code: "ar", label: "العربية", flagUrl: "https://flagcdn.com/sa.svg" },
]

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const menuRef = useRef<HTMLDivElement>(null)

  const currentLang = languageOptions.find(l => l.code === language) || languageOptions[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-7 h-7 rounded-full hover:ring-2 hover:ring-slate-700 transition-all border border-slate-300 dark:border-slate-700/50 shadow-sm overflow-hidden"
        title="Ganti Bahasa"
      >
        <img src={currentLang.flagUrl} alt={currentLang.label} className="w-full h-full object-cover" />
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-40 bg-[var(--color-dash-panel)] border border-slate-300 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="py-1">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors
                  ${language === lang.code 
                    ? "bg-orange-500 dark:bg-blue-500/10 text-orange-500 dark:text-blue-400 font-semibold" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white"
                  }`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700/50">
                  <img src={lang.flagUrl} alt={lang.label} className="w-full h-full object-cover" />
                </div>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
