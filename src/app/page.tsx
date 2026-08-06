import { db } from "@/db"
import { pengaturan } from "@/db/schema"
import { inArray, eq, and } from "drizzle-orm"
import { DashboardClient } from "./DashboardClient"
import { getServerTenantId } from "@/server/auth"

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const tenantId = await getServerTenantId();
  if (!tenantId) {
    return <DashboardClient hasAiKey={false} hasIpaymuKey={false} isWaActive={false} />;
  }

  // Fetch real API status from DB strictly for this tenant
  const settingsDb = await db.select().from(pengaturan).where(
    and(
      eq(pengaturan.tenantId, tenantId),
      inArray(pengaturan.kunci, ["deepseek_key", "ipaymu_key", "ipaymu_va", "wa_bot_url"])
    )
  );
  
  let hasAiKey = false;
  let hasIpaymuKey = false;
  let customBotUrl = "";
  
  settingsDb.forEach(s => {
    if (s.kunci === "deepseek_key" && s.nilai && s.nilai.length > 5) hasAiKey = true;
    if (s.kunci === "ipaymu_key" && s.nilai && s.nilai.length > 5) hasIpaymuKey = true;
    if (s.kunci === "wa_bot_url" && s.nilai && s.nilai.length > 5) customBotUrl = s.nilai;
  });

  let waStatus = "disconnected";
  try {
    // Gunakan URL Bot khusus tenant jika ada, jika tidak, cek global bot URL
    const botUrl = customBotUrl || process.env.NEXT_PUBLIC_BOT_URL;
    if (botUrl) {
      // Hilangkan slash di akhir URL jika ada
      const normalizedBotUrl = botUrl.replace(/\/+$/, "");
      console.log(`[Dashboard] Fetching WA Status from: ${normalizedBotUrl}/api/wa/status untuk Tenant: ${tenantId}`);
      
      const res = await fetch(`${normalizedBotUrl}/api/wa/status`, { cache: "no-store", next: { revalidate: 0 } });
      if (res.ok) {
        const data = await res.json();
        waStatus = data.status || "disconnected";
      }
    }
  } catch(e) {
    console.error("WA Status fetch error:", e);
  }
  
  const isWaActive = waStatus === "connected";

  return <DashboardClient hasAiKey={hasAiKey} hasIpaymuKey={hasIpaymuKey} isWaActive={isWaActive} />;
}
