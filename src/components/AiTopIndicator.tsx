"use client"
import { useLanguage } from "@/contexts/LanguageContext"
import { Sparkles, BotOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AiTopIndicator({ active }: { active: boolean }) {
  const { t } = useLanguage();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium cursor-default transition-colors ${
            active 
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
            : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
          }`}>
            {active ? <Sparkles className="w-3.5 h-3.5" /> : <BotOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline-block">{active ? (t("topbar.ai_active") || "AI Aktif") : (t("topbar.ai_inactive") || "AI Nonaktif")}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-800 border-slate-700 text-slate-200">
          <p>{active ? (t("topbar.ai_active_desc") || "AI Bot Aktif (API Key terpasang)") : (t("topbar.ai_inactive_desc") || "AI Bot Nonaktif (API Key belum diatur)")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
