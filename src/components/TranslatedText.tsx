"use client"

import { useLanguage } from "@/contexts/LanguageContext"

export function TranslatedText({ tKey, params }: { tKey: string, params?: Record<string, string | number> }) {
  const { t } = useLanguage()
  return <>{t(tKey, params)}</>
}

export function TranslatedInput({ tKey, className }: { tKey: string, className?: string }) {
  const { t } = useLanguage()
  return (
    <input 
      type="text" 
      placeholder={t(tKey)} 
      className={className}
    />
  )
}




