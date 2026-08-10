"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderProfile } from "@/components/HeaderProfile";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrentDate } from "@/components/CurrentDate";
import { UpdateButton } from "@/components/UpdateButton";
import { AboutApp } from "@/components/AboutApp";
import { AiTopIndicator } from "@/components/AiTopIndicator";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, ChevronRight } from "lucide-react";

interface LayoutWrapperProps {
  children: React.ReactNode;
  namaLembaga: string;
  alamatLembaga: string;
  hasAiKey: boolean;
  ownerName: string;
}

export function LayoutWrapper({ 
  children, 
  namaLembaga, 
  alamatLembaga, 
  hasAiKey, 
  ownerName 
}: LayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/onboarding") || pathname.startsWith("/register");

  // Polling to detect if account was deleted via Telegram
  useEffect(() => {
    if (isAuthPage) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        const data = await res.json();
        if (data.activated === false) {
          // Account was deleted/deactivated! Kick user out.
          localStorage.removeItem("token");
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/";
        }
      } catch (e) {
        // Ignore network errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthPage]);

  if (isAuthPage) {
    return <main className="flex-1 w-full min-h-screen">{children}</main>;
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbMap: Record<string, string> = {
    santri: "Direktori Siswa",
    tunggakan: "Kelola Tagihan",
    kasir: "Point of Sale (POS)",
    wa: "Terminal WhatsApp AI",
    settings: "Pengaturan Sistem",
    laporan: "Laporan Keuangan",
    template: "Template Pesan WA",
  };
  const currentSection = pathSegments.length > 0 ? breadcrumbMap[pathSegments[0]] || pathSegments[0] : "Dashboard";

  return (
    <SidebarProvider>
      <AppSidebar namaPesantren={namaLembaga} alamatPesantren={alamatLembaga} ownerName={ownerName} />
      <SidebarInset className="bg-[var(--color-background)] flex flex-col flex-1 w-full min-w-0 pb-[72px] md:pb-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/60 bg-[var(--color-dash-bg)]/80 backdrop-blur-[10px] px-3 sm:px-4 lg:px-6 z-10 sticky top-0 shadow-sm gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-none">
            <SidebarTrigger className="text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:text-white hidden md:flex" />
            <div className="hidden lg:flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 font-medium">
              <span className="hover:text-slate-900 dark:text-white transition-colors cursor-pointer">Utama</span>
              <ChevronRight className="w-4 h-4 mx-1 opacity-80" />
              <span className="text-orange-500 dark:text-blue-400 capitalize">{currentSection}</span>
            </div>
            <div className="lg:hidden text-sm font-bold text-slate-900 dark:text-white capitalize">{currentSection}</div>
          </div>
          
          {/* Global Search Bar */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-700 group-focus-within:text-orange-500 dark:text-blue-400 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Cari NIS, Nama Siswa, atau Transaksi..." 
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl leading-5 bg-[#1e293b] text-slate-700 dark:text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white dark:bg-[#0f172a] focus:ring-1 focus:ring-orange-500 dark:ring-blue-500 focus:border-orange-500 dark:border-blue-500 sm:text-sm transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-none">
            <div className="block">
              <AiTopIndicator active={hasAiKey} />
            </div>
            <div className="hidden sm:block">
              <UpdateButton />
            </div>
            <div className="hidden md:block">
              <CurrentDate />
            </div>
            <LanguageSwitcher />
            <div className="hidden sm:block">
              <AboutApp />
            </div>
            <ThemeToggle />
            <HeaderProfile ownerName={ownerName} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-page-enter relative">
          {children}
        </main>
        
        {/* Footer v08.10 - Quote & Info */}
        <footer className="hidden md:block border-t border-slate-200 dark:border-slate-800/60 bg-[var(--color-dash-bg)]/95 backdrop-blur-[10px] px-6 py-3">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 dark:bg-blue-500/10 text-orange-500 dark:text-blue-400 border border-orange-500/20 dark:border-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                "Kelola keuangan pesantren dengan amanah, transparan, dan penuh keberkahan."
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-medium">{namaLembaga}{alamatLembaga ? ` \u2014 ${alamatLembaga}` : ''}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Powered by <a href="https://satujalan.id" target="_blank" rel="noopener noreferrer" className="text-orange-500 dark:text-blue-400 hover:underline">satujalan.id</a>
                <span className="text-slate-500 ml-2">v2026.08.10</span>
              </p>
            </div>
          </div>
        </footer>
        
        {/* Mobile Navigation */}
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}




