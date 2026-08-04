import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, MessageSquare } from "lucide-react"
import { getSettings } from "@/server/settings"
import { TranslatedText } from "@/components/TranslatedText"

export default async function TemplatePage() {
  const initialData = await getSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><TranslatedText tKey="template.title" /></h1>
        <p className="text-muted-foreground mt-2">
          <TranslatedText tKey="template.subtitle" />
        </p>
      </div>

      <Card className="bg-[#1e293b] border-slate-700 text-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            <TranslatedText tKey="template.format_title" />
          </CardTitle>
          <CardDescription>
            <TranslatedText tKey="template.format_desc" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea 
            className="h-64 font-mono text-sm border-slate-700 bg-[#0f172a] text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
            defaultValue={`Assalamualaikum Wr. Wb.
Bapak/Ibu Wali Santri dari {nama_santri} (NIS: {nis}),

Bersama pesan otomatis ini kami menginformasikan bahwa sisa tagihan/saldo administrasi ananda saat ini adalah sebesar Rp {sisa_tagihan}.

Mohon untuk segera melakukan pelunasan melalui link iPaymu berikut ini: 
{link_pembayaran}

Jika ada pertanyaan, silakan balas pesan ini (akan dibalas oleh AI Otak CS).

Terima kasih,
Pengurus Finance Pesantren.`}
          />
          <div className="flex justify-end">
            <Button size="lg" className="shadow-lg shadow-primary/20">
              <Save className="mr-2 h-4 w-4" /> <TranslatedText tKey="template.save" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
