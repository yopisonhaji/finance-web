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
import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";

import { db } from "@/db";
import { pengaturan, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settingsData = await db
    .select()
    .from(pengaturan)
    .where(eq(pengaturan.kunci, "nama_pesantren"));
    
  const namaLembaga = settingsData.length > 0 ? settingsData[0].nilai : "Finance";

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
  const settingsData = await db
    .select()
    .from(pengaturan)
    .where(inArray(pengaturan.kunci, ["nama_pesantren", "alamat", "deepseek_key", "OWNER_NAMA", "OWNER_WA", "TIPE_BISNIS"]));
    
  let namaLembaga = "Finance";
  let alamatLembaga = "";
  let hasAiKey = false;
  let isOwnerSet = false;
  let isWaSet = false;
  let ownerName = "Admin";
  let tipeBisnis = "";
  
  const usersData = await db.select().from(users);
  const hasUsers = usersData.length > 0;
  
  settingsData.forEach((s) => {
    if (s.kunci === "nama_pesantren") namaLembaga = s.nilai;
    if (s.kunci === "alamat") alamatLembaga = s.nilai;
    if (s.kunci === "deepseek_key" && s.nilai && s.nilai.length > 5) hasAiKey = true;
    if (s.kunci === "OWNER_NAMA" && s.nilai) {
      isOwnerSet = true;
      ownerName = s.nilai;
    }
    if (s.kunci === "OWNER_WA" && s.nilai) {
      isWaSet = true;
    }
    if (s.kunci === "TIPE_BISNIS") tipeBisnis = s.nilai;
  });

  const isActivated = isOwnerSet && isWaSet && hasUsers;

  if (!isActivated) {
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
          enableSystem
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
