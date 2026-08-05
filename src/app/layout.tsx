import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppConfigProvider } from "@/contexts/AppConfigContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrentDate } from "@/components/CurrentDate";
import { UpdateButton } from "@/components/UpdateButton";
import { AboutApp } from "@/components/AboutApp";
import { AiTopIndicator } from "@/components/AiTopIndicator";
import { SetupScreen } from "@/components/SetupScreen";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ForceLogout } from "@/components/ForceLogout";
import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";

import { db } from "@/db";
import { pengaturan, users } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { getServerTenantId } from "@/server/auth";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await getServerTenantId();
  let namaLembaga = "Finance";

  if (tenantId) {
    const settingsData = await db
      .select()
      .from(pengaturan)
      .where(and(eq(pengaturan.kunci, "nama_pesantren"), eq(pengaturan.tenantId, tenantId)));
      
    if (settingsData.length > 0) namaLembaga = settingsData[0].nilai;
  }

  return {
    title: `${namaLembaga} AI`,
    description: `Aplikasi Keuangan & Manajemen ${namaLembaga}`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenantId = await getServerTenantId();
  
  let settingsData: any[] = [];
  if (tenantId) {
    settingsData = await db
      .select()
      .from(pengaturan)
      .where(and(inArray(pengaturan.kunci, ["nama_pesantren", "alamat", "deepseek_key", "OWNER_NAMA", "OWNER_WA", "TIPE_BISNIS"]), eq(pengaturan.tenantId, tenantId)));
  }
    
  let namaLembaga = "Finance";
  let alamatLembaga = "";
  let hasAiKey = false;
  let isOwnerSet = false;
  let isWaSet = false;
  let ownerName = "Admin";
  let tipeBisnis = "";
  
  if (settingsData && settingsData.length > 0) {
    settingsData.forEach(setting => {
      if (setting.kunci === "nama_pesantren") namaLembaga = setting.nilai;
      if (setting.kunci === "alamat") alamatLembaga = setting.nilai;
      if (setting.kunci === "deepseek_key") hasAiKey = !!setting.nilai;
      if (setting.kunci === "OWNER_NAMA") ownerName = setting.nilai;
      if (setting.kunci === "OWNER_WA") isWaSet = !!setting.nilai;
      if (setting.kunci === "TIPE_BISNIS") tipeBisnis = setting.nilai;
    });
  }
  
  const usersData = await db.select().from(users);
  const isFreshInstall = usersData.length === 0;

  // Jika user sudah login (punya token) tapi tenantId nya tidak ada di DB (karena dihapus)
  if (tenantId && !isFreshInstall) {
    const isTenantExist = usersData.some(u => u.tenantId === tenantId);
    if (!isTenantExist) {
      return (
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.className} min-h-screen bg-slate-900 antialiased`}>
            <ForceLogout />
          </body>
        </html>
      );
    }
  }

  if (isFreshInstall) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-slate-50 antialiased`}>
          <SetupScreen />
          <div style={{ display: 'none' }}>{children}</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[var(--color-dash-bg)] text-white antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppConfigProvider initialTipeBisnis={tipeBisnis}>
            <LanguageProvider>
              <LayoutWrapper 
                namaLembaga={namaLembaga} 
                alamatLembaga={alamatLembaga} 
                hasAiKey={hasAiKey} 
                ownerName={ownerName}
              >
                {children}
              </LayoutWrapper>
            </LanguageProvider>
          </AppConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
