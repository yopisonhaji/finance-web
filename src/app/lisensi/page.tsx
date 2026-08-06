import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, KeyRound, Clock } from "lucide-react"

export default function LisensiPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lisensi & Kuota</h1>
        <p className="text-muted-foreground mt-2">
          Informasi berlangganan dan batas pemakaian layanan (API Rate Limits).
        </p>
      </div>

      <Card className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl">
        <CardHeader className="bg-primary/5 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-primary">
                <ShieldCheck className="mr-2 h-6 w-6" />
                Lisensi Pro Aktif
              </CardTitle>
              <CardDescription className="mt-1">
                Aplikasi Finance AI (Versi Web-Desktop)
              </CardDescription>
            </div>
            <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
              LIFETIME
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-muted p-3 rounded-full">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">Masa Aktif</p>
              <p className="text-muted-foreground">Berlaku seumur hidup (Tanpa batas waktu).</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-muted p-3 rounded-full">
              <KeyRound className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <p className="font-semibold text-lg">Kuota AI Bulanan (Bot WA)</p>
                <p className="font-bold">Unlimited*</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                *Menggunakan API Key Pribadi Anda, kuota bergantung pada batas yang telah Anda tetapkan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
