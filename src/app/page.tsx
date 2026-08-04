import { db } from "@/db"
import { pengaturan } from "@/db/schema"
import { inArray } from "drizzle-orm"
import fs from "fs"
import path from "path"
import { DashboardClient } from "./DashboardClient"

export default async function Dashboard() {
  // Fetch real API status from DB
  const settingsDb = await db.select().from(pengaturan).where(inArray(pengaturan.kunci, ["deepseek_key", "ipaymu_key", "ipaymu_va"]));
  
  let hasAiKey = false;
  let hasIpaymuKey = false;
  
  settingsDb.forEach(s => {
    if (s.kunci === "deepseek_key" && s.nilai && s.nilai.length > 5) hasAiKey = true;
    if (s.kunci === "ipaymu_key" && s.nilai && s.nilai.length > 5) hasIpaymuKey = true;
  });

  // Fetch WA Status from wa-state.json
  let waStatus = "disconnected";
  try {
    const waStatePath = path.join(process.cwd(), "wa-state.json");
    if (fs.existsSync(waStatePath)) {
      const waState = JSON.parse(fs.readFileSync(waStatePath, "utf-8"));
      waStatus = waState.status;
    }
  } catch(e) {}
  
  const isWaActive = waStatus === "connected";

  return <DashboardClient hasAiKey={hasAiKey} hasIpaymuKey={hasIpaymuKey} isWaActive={isWaActive} />;
}
