import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
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
      .where(and(inArray(pengaturan.kunci, ["nama_pesantren", "alamat", "deepseek_key", "OWNER_NAMA", "OWNER_WA", "TIPE_BISNIS", "PAYMENT_MODE"]), eq(pengaturan.tenantId, tenantId)));
  }
    
  let namaLembaga = "Finance";
  let alamatLembaga = "";
  let hasAiKey = false;
  let isOwnerSet = false;
  let isWaSet = false;
  let ownerName = "Admin";
  let tipeBisnis = "";
  let paymentMode = "DEFAULT";
  
  if (settingsData && settingsData.length > 0) {
    settingsData.forEach(setting => {
      if (setting.kunci === "nama_pesantren") namaLembaga = setting.nilai;
      if (setting.kunci === "alamat") alamatLembaga = setting.nilai;
      if (setting.kunci === "deepseek_key") hasAiKey = !!setting.nilai;
      if (setting.kunci === "OWNER_NAMA") ownerName = setting.nilai;
      if (setting.kunci === "OWNER_WA") isWaSet = !!setting.nilai;
      if (setting.kunci === "TIPE_BISNIS") tipeBisnis = setting.nilai;
      if (setting.kunci === "PAYMENT_MODE") paymentMode = setting.nilai;
    });
  }
  
  let isFreshInstall = false;
  let isTenantExist = false;

  const usersCheck = await db.select({ tenantId: users.tenantId }).from(users).limit(10);
  isFreshInstall = usersCheck.length === 0;

  if (tenantId && !isFreshInstall) {
    const currentTenant = await db.select({ id: users.id }).from(users).where(eq(users.tenantId, tenantId)).limit(1);
    isTenantExist = currentTenant.length > 0;
    
    if (!isTenantExist) {
      return (
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.className} min-h-screen bg-white dark:bg-slate-900 antialiased`}>
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppConfigProvider initialTipeBisnis={tipeBisnis} initialPaymentMode={paymentMode}>
              <LanguageProvider>
                <SetupScreen />
                <div style={{ display: 'none' }}>{children}</div>
              </LanguageProvider>
            </AppConfigProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[var(--color-dash-bg)] text-slate-900 dark:text-white antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppConfigProvider initialTipeBisnis={tipeBisnis} initialPaymentMode={paymentMode}>
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




