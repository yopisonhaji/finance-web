import { db } from "@/db"
import { pengaturan } from "@/db/schema"
import { inArray } from "drizzle-orm"
import path from "path"
import { DashboardClient } from "./DashboardClient"

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // Fetch real API status from DB
  const settingsDb = await db.select().from(pengaturan).where(inArray(pengaturan.kunci, ["deepseek_key", "ipaymu_key", "ipaymu_va"]));
  
  let hasAiKey = false;
  let hasIpaymuKey = false;
  
  settingsDb.forEach(s => {
    if (s.kunci === "deepseek_key" && s.nilai && s.nilai.length > 5) hasAiKey = true;
    if (s.kunci === "ipaymu_key" && s.nilai && s.nilai.length > 5) hasIpaymuKey = true;
  });

  let waStatus = "disconnected";
  try {
    const botUrl = process.env.NEXT_PUBLIC_BOT_URL || "http://127.0.0.1:8081";
    console.log("Fetching WA Status from:", `${botUrl}/api/wa/status`);
    const res = await fetch(`${botUrl}/api/wa/status`, { cache: "no-store", next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      console.log("WA Status response:", data);
      waStatus = data.status || "disconnected";
    } else {
      console.error("WA Status fetch failed with status:", res.status);
    }
  } catch(e) {
    console.error("WA Status fetch error:", e);
  }
  
  const isWaActive = waStatus === "connected";

  return <DashboardClient hasAiKey={hasAiKey} hasIpaymuKey={hasIpaymuKey} isWaActive={isWaActive} />;
}
