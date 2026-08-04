"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Banknote, CreditCard, Receipt } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Santri } from "@/app/santri/actions"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import { processBayarTunai } from "@/server/kasir"
import { generatePaymentLink } from "@/server/ipaymu"
import { useLanguage } from "@/contexts/LanguageContext"

interface PaymentPanelProps {
  santri: Santri | null
}

const paymentSchema = z.object({
  amount: z.coerce.number().min(1000, { message: "Minimal pembayaran Rp 1.000" }),
})

export function PaymentPanel({ santri }: PaymentPanelProps) {
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<"TUNAI" | "IPAYMU">("TUNAI")
  const { t } = useLanguage()

  const form = useForm<any>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: 0,
    },
  })

  // Watch santri change to update default amount to saldo
  // But wait, the saldo in UI is just a display
  if (!santri) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-6 border-dashed bg-[#0f172a] border-slate-700 shadow-xl">
        <Receipt className="h-16 w-16 text-slate-500 mb-4" />
        <h3 className="text-xl font-medium text-slate-200">{t("pos.empty_panel_title")}</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          {t("pos.empty_panel_desc")}
        </p>
      </Card>
    )
  }

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    setLoading(true)
    if (method === "TUNAI") {
      const res = await processBayarTunai(santri!.id, values.amount)
      if (res.success) {
        alert(res.message)
        form.reset()
      } else {
        alert("Gagal: " + res.message)
      }
    } else {
      const orderId = `IPAY-${santri!.id}-${Math.random().toString(36).substr(2,6).toUpperCase()}`
      const res = await generatePaymentLink(orderId, values.amount, {
        name: santri!.nama_wali || santri!.nama,
        phone: santri!.no_wa || "08000000000"
      })
      if (res.success) {
        alert("Link Berhasil Dibuat! (Di dunia nyata, link ini otomatis terkirim via WA ke Wali Santri).\nURL: " + res.url)
        window.open(res.url, "_blank")
      } else {
        alert("Gagal membuat link: " + res.message)
      }
    }
    setLoading(false)
  }

  const tagihanFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  })

  return (
    <Card className="h-full border-primary/20 shadow-lg shadow-primary/5 flex flex-col">
      <CardHeader className="bg-primary/5 border-b border-border/50 pb-6">
        <CardTitle className="text-2xl">{santri.nama}</CardTitle>
        <CardDescription className="text-base mt-1">NIS: {santri.nis} • {t("pos.class")}: {santri.kelas}</CardDescription>
        
        <div className="mt-4 bg-background p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div className="text-muted-foreground font-medium">{t("pos.remaining_bill")}</div>
          <div className="text-3xl font-bold text-destructive">
            {tagihanFormatter.format(Math.max(0, santri.saldo || 0))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-6 flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">{t("pos.payment_amount")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="text-2xl h-14 font-semibold" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 mt-4">
              <FormLabel className="text-base">{t("pos.payment_method")}</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={method === "TUNAI" ? "default" : "outline"}
                  className="h-14 text-lg font-medium"
                  onClick={() => setMethod("TUNAI")}
                >
                  <Banknote className="mr-2 h-5 w-5" /> {t("pos.cash")}
                </Button>
                <Button
                  type="button"
                  variant={method === "IPAYMU" ? "default" : "outline"}
                  className="h-14 text-lg font-medium"
                  onClick={() => setMethod("IPAYMU")}
                >
                  <CreditCard className="mr-2 h-5 w-5" /> {t("pos.ipaymu")}
                </Button>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Separator className="mb-6" />
              <Button type="submit" size="lg" className="w-full h-16 text-xl font-bold shadow-xl shadow-primary/20" disabled={loading}>
                {loading ? t("pos.processing") : `${t("pos.process")} ${method === 'TUNAI' ? t("pos.cash") : t("pos.ipaymu")}`}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
