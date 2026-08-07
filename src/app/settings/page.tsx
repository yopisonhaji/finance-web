import { SettingsTabs } from "@/components/settings/SettingsTabs"
import { getSettings } from "@/server/settings"
import { TranslatedText } from "@/components/TranslatedText"

export default async function SettingsPage() {
  const initialData = await getSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><TranslatedText tKey="settings.title" /></h1>
        <p className="text-muted-foreground mt-2">
          <TranslatedText tKey="settings.subtitle" />
        </p>
      </div>

      <SettingsTabs initialData={initialData} />
    </div>
  )
}




