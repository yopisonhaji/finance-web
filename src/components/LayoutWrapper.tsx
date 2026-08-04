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
  const isAuthPage = pathname === "/login" || pathname === "/onboarding";

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

  return (
    <SidebarProvider>
      <AppSidebar namaPesantren={namaLembaga} alamatPesantren={alamatLembaga} />
      <SidebarInset className="bg-[var(--color-background)] flex flex-col flex-1 w-full min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/60 bg-[var(--color-dash-bg)]/80 backdrop-blur-[10px] px-3 sm:px-4 lg:px-6 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <SidebarTrigger className="text-slate-400 hover:text-white" />
            <div className="hidden sm:block">
              <AboutApp />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <AiTopIndicator active={hasAiKey} />
            </div>
            <div className="hidden sm:block">
              <UpdateButton />
            </div>
            <div className="hidden lg:block">
              <CurrentDate />
            </div>
            <LanguageSwitcher />
            <HeaderProfile ownerName={ownerName} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-page-enter">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
