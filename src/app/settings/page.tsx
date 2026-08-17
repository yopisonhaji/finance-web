import { SettingsTabs } from "@/components/settings/SettingsTabs"
import { getSettings } from "@/server/settings"
import { TranslatedText } from "@/components/TranslatedText"
import { db } from "@/db"
import { ai_settings, ai_knowledge_base } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function SettingsPage() {
  const initialData = await getSettings();
  
  // Ambil pengaturan RAG dari database terpisah untuk digabung ke initialData
  const tenantId = initialData.tenantId || "tenant-1";
  const aiSettings = await db.select().from(ai_settings).where(eq(ai_settings.tenantId, tenantId)).get();
  const kb = await db.select().from(ai_knowledge_base).where(eq(ai_knowledge_base.tenantId, tenantId)).get();

  if (aiSettings) {
    initialData.namaUsaha = aiSettings.namaUsaha || "";
    initialData.sapaanPelanggan = aiSettings.sapaanPelanggan || "Kak";
    initialData.gayaBahasa = aiSettings.gayaBahasa || "Formal";
    initialData.aturanKhusus = aiSettings.aturanKhusus || "";
    if (aiSettings.basaBasi) {
      try {
        const basaBasi = JSON.parse(aiSettings.basaBasi);
        initialData.basaBasi_p = basaBasi.p || "";
        initialData.basaBasi_halo = basaBasi.halo || "";
        initialData.basaBasi_terimakasih = basaBasi.terimakasih || "";
        initialData.basaBasi_ok = basaBasi.ok || "";
      } catch (e) {
        console.error("Gagal parse basaBasi", e);
      }
    }
  }
  
  if (kb) {
    initialData.knowledgeUrl = kb.sumber || "";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><TranslatedText tKey="settings.title" /></h1>
        <p className="text-muted-foreground mt-2">
          <TranslatedText tKey="settings.subtitle" />
        </p>
      </div>

      <SettingsTabs initialData={initialData} isGuest={initialData.is_guest === "true"} />
    </div>
  )
}




