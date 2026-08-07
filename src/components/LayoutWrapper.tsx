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
            <div className="hidden sm:block">
              <AiTopIndicator active={hasAiKey} />
            </div>
            <div className="hidden sm:block">
              <UpdateButton />
            </div>
            <div className="block">
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
        
        {/* Mobile Navigation */}
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}




