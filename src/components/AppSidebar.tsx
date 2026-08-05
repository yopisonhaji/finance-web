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
  MessageSquareShare,
  Users,
  Wallet,
  FileText,
  Settings,
  Bot,
  FileBox,
  KeyRound,
  MessageSquare,
  RefreshCw,
  UserCircle
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { useLanguage } from "@/contexts/LanguageContext"
import { useAppConfig } from "@/contexts/AppConfigContext"

const getNavGroups = (t: (key: string) => string, clientTerm: string) => [
  {
    title: "UTAMA",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        color: "text-blue-400",
        hoverColor: "group-hover:text-blue-300",
      }
    ]
  },
  {
    title: "MANAJEMEN DATA",
    items: [
      {
        title: `Direktori Klien/Siswa`,
        url: "/santri",
        icon: Users,
        color: "text-indigo-400",
        hoverColor: "group-hover:text-indigo-300",
      }
    ]
  },
  {
    title: "KEUANGAN & TRANSAKSI",
    items: [
      {
        title: "Point of Sale (POS)",
        url: "/kasir",
        icon: Wallet,
        color: "text-emerald-400",
        hoverColor: "group-hover:text-emerald-300",
      },
      {
        title: "Kelola Tagihan",
        url: "/tunggakan",
        icon: FileText,
        color: "text-rose-400",
        hoverColor: "group-hover:text-rose-300",
      },
      {
        title: "Laporan Keuangan",
        url: "/laporan",
        icon: FileBox,
        color: "text-orange-400",
        hoverColor: "group-hover:text-orange-300",
      }
    ]
  },
  {
    title: "OTOMASI & INTEGRASI",
    items: [
      {
        title: "Terminal WhatsApp AI",
        url: "/wa",
        icon: MessageSquareShare,
        color: "text-teal-400",
        hoverColor: "group-hover:text-teal-300",
      },
      {
        title: "Template Pesan WA",
        url: "/template",
        icon: MessageSquare,
        color: "text-orange-400",
        hoverColor: "group-hover:text-orange-300",
      }
    ]
  },
  {
    title: "SISTEM",
    items: [
      {
        title: "Pengaturan",
        url: "/settings",
        icon: Settings,
        color: "text-slate-400",
        hoverColor: "group-hover:text-slate-300",
      }
    ]
  }
];

export function AppSidebar({ namaPesantren = "Finance", alamatPesantren = "", ownerName = "Admin" }: { namaPesantren?: string, alamatPesantren?: string, ownerName?: string }) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { clientTerm } = useAppConfig();
  const groups = getNavGroups(t, clientTerm);

  return (
    <Sidebar side={language === 'ar' ? 'right' : 'left'} variant="sidebar" collapsible="icon" className="border-r border-slate-800/60 bg-[var(--color-dash-bg)] hidden md:flex">
      <SidebarHeader className="p-4 bg-[var(--color-dash-bg)] border-b border-slate-800/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-500/50 shadow-sm flex items-center justify-center bg-[#1e293b] flex-shrink-0">
            <UserCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-sm font-bold text-white leading-tight tracking-wide truncate max-w-[150px]">{ownerName}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5 truncate max-w-[150px]">{namaPesantren}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[var(--color-dash-bg)] px-3 pt-2">
        {groups.map((group) => (
          <SidebarGroup key={group.title} className="group-data-[collapsible=icon]:p-0">
            <div className="text-[10px] font-bold text-slate-500 mb-2 mt-4 uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
              {group.title}
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                  return (
                    <SidebarMenuItem key={item.title}>
                      {/* @ts-ignore */}
                      <SidebarMenuButton asChild tooltip={item.title} className="h-auto p-0 hover:bg-transparent">
                        <Link 
                          href={item.url} 
                          className={`group relative flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 overflow-hidden ${
                            isActive 
                              ? 'bg-blue-500/10 text-white border border-blue-500/20 shadow-[0_2px_10px_rgba(59,130,246,0.1)]' 
                              : 'text-slate-400 hover:text-white hover:bg-[#1e293b] border border-transparent'
                          }`}
                        >
                          {isActive && (
                            <>
                              <div className="absolute inset-0 bg-blue-500/5 rounded-lg"></div>
                              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                            </>
                          )}
                          
                          <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 shrink-0 ${
                            isActive 
                              ? 'bg-blue-500/20 text-white border border-blue-500/30' 
                              : `bg-slate-800/30 ${item.color} group-hover:bg-slate-700/50 ${item.hoverColor}`
                          }`}>
                            <item.icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                          </div>
                          
                          <span className={`relative z-10 font-medium tracking-wide transition-all duration-200 text-[13px] group-data-[collapsible=icon]:hidden ${isActive ? 'font-semibold text-white' : item.hoverColor}`}>
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
