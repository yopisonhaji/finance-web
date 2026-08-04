"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  MessageSquareShare,
  Users,
  Wallet,
  FileText,
  Settings,
  Bot,
  FileBox,
  KeyRound,
  MessageSquare,
  RefreshCw
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { useLanguage } from "@/contexts/LanguageContext"
import { useAppConfig } from "@/contexts/AppConfigContext"

const getNavItems = (t: (key: string) => string, clientTerm: string) => [
  {
    title: t("sidebar.dashboard"),
    url: "/",
    icon: LayoutDashboard,
    color: "text-blue-400",
    hoverColor: "group-hover:text-blue-300",
  },
  {
    title: `Data ${clientTerm}`,
    url: "/santri",
    icon: Users,
    color: "text-indigo-400",
    hoverColor: "group-hover:text-indigo-300",
  },
  {
    title: t("sidebar.arrears"),
    url: "/tunggakan",
    icon: FileText,
    color: "text-rose-400",
    hoverColor: "group-hover:text-rose-300",
  },
  {
    title: t("sidebar.wa_template"),
    url: "/template",
    icon: FileBox,
    color: "text-orange-400",
    hoverColor: "group-hover:text-orange-300",
  },
  {
    title: t("sidebar.pos"),
    url: "/kasir",
    icon: Wallet,
    color: "text-emerald-400",
    hoverColor: "group-hover:text-emerald-300",
  },
  {
    title: "WhatsApp Bot", // Intentionally kept for now since it's a specific brand name
    url: "/wa",
    icon: MessageSquareShare,
    color: "text-teal-400",
    hoverColor: "group-hover:text-teal-300",
  },
  {
    title: t("sidebar.reports"),
    url: "/laporan",
    icon: FileText,
    color: "text-rose-400",
    hoverColor: "group-hover:text-rose-300",
  },
  {
    title: t("sidebar.settings"),
    url: "/settings",
    icon: Settings,
    color: "text-slate-400",
    hoverColor: "group-hover:text-slate-300",
  },
]

export function AppSidebar({ namaPesantren = "Finance", alamatPesantren = "" }: { namaPesantren?: string, alamatPesantren?: string }) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { clientTerm } = useAppConfig();
  const items = getNavItems(t, clientTerm);

  return (
    <Sidebar side={language === 'ar' ? 'right' : 'left'} variant="sidebar" className="border-r border-slate-800/60 bg-[var(--color-dash-bg)] rtl:border-r-0 rtl:border-l">
      <SidebarHeader className="p-6 bg-[var(--color-dash-bg)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-500/50 shadow-sm flex items-center justify-center bg-white flex-shrink-0">
            <img src="/logo-finance.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight tracking-wide">{namaPesantren} <span className="text-blue-500">AI</span></h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Asisten Chat & Pay AI 24 jam</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[var(--color-dash-bg)] px-3 pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 mt-1">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    {/* @ts-ignore */}
                    <SidebarMenuButton asChild tooltip={item.title} className="h-auto p-0 hover:bg-transparent">
                      <Link 
                        href={item.url} 
                        className={`group relative flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 overflow-hidden ${
                          isActive 
                            ? 'bg-blue-500/10 text-white border border-blue-500/20 shadow-[0_2px_10px_rgba(59,130,246,0.1)]' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30 hover:translate-x-[3px] border border-transparent'
                        }`}
                      >
                        {/* Subtle Highlight inside active item */}
                        {isActive && (
                          <>
                            <div className="absolute inset-0 bg-blue-500/5 rounded-lg"></div>
                            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                          </>
                        )}
                        
                        {/* Icon Wrapper for 3D feel */}
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
                          isActive 
                            ? 'bg-blue-500/20 text-white border border-blue-500/30' 
                            : `bg-slate-800/30 ${item.color} group-hover:bg-slate-700/50 ${item.hoverColor}`
                        }`}>
                          <item.icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                        </div>
                        
                        <span className={`relative z-10 font-medium tracking-wide transition-all duration-200 text-[14px] ${isActive ? 'font-semibold text-white' : item.hoverColor}`}>
                          {item.title}
                        </span>

                        {/* Right Dot Indicator for Active Item */}
                        {isActive && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-[var(--color-dash-bg)]">
        <div className="relative overflow-hidden rounded-xl bg-[var(--color-dash-panel)] border border-slate-800/40 p-5 mt-auto">
          {/* Mosque Silhouette Illustration */}
          <div className="absolute bottom-0 inset-x-0 h-20 opacity-15 pointer-events-none">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full fill-blue-400">
               <path d="M0 40 L0 35 L5 35 L5 30 L10 30 L10 20 C10 15 15 10 20 10 L25 10 C30 10 35 15 35 20 L35 35 L40 35 L40 30 C40 25 45 20 50 20 C55 20 60 25 60 30 L60 35 L65 35 L65 20 C65 15 70 10 75 10 L80 10 C85 10 90 15 90 20 L90 30 L95 30 L95 35 L100 35 L100 40 Z" />
               <circle cx="22.5" cy="18" r="2" fill="currentColor"/>
               <circle cx="77.5" cy="18" r="2" fill="currentColor"/>
               <path d="M50 8 C48 15 52 15 50 8 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="relative z-10 text-center space-y-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 mb-1 border border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              "Kelola keuangan pesantren dengan amanah, transparan, dan penuh keberkahan."
            </p>
            <div className="pt-3 mt-3 border-t border-slate-700/50">
              <p className="text-[10px] text-slate-500 font-medium">{namaPesantren}</p>
              {alamatPesantren && <p className="text-[9px] text-slate-600 mt-0.5">{alamatPesantren}</p>}
              <p className="text-[9px] text-slate-500 mt-2">© {new Date().getFullYear()} satujalan.id</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
