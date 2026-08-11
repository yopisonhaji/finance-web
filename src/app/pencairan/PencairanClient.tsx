"use client"

import { useState } from "react"
import { Banknote, HandCoins, ArrowDownCircle, ArrowUpCircle, AlertCircle, Loader2, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PencairanClient({ saldo, riwayatMasuk, riwayatTarik, bankInfo }: any) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState<string>("")

  const formatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })

  const handleTarik = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseInt(amount.replace(/\D/g, ""))
    
    if (!numAmount || numAmount < 50000) {
      alert("Minimal pencairan adalah Rp 50.000")
      return
    }

    if (numAmount > saldo) {
      alert("Saldo tidak mencukupi")
      return
    }

    if (!bankInfo.bank || !bankInfo.noRek || !bankInfo.atasNama) {
      alert("Silakan lengkapi informasi rekening bank Anda di menu Pengaturan terlebih dahulu.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/pencairan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount })
      })
      const data = await res.json()
      if (res.ok) {
        alert("Permintaan pencairan berhasil diajukan. Dana akan masuk ke rekening Anda maksimal 1x24 jam kerja.")
        window.location.reload()
      } else {
        alert("Gagal: " + data.error)
      }
    } catch (e: any) {
      alert("Error: " + e.message)
    }
    setLoading(false)
  }

  const formatDateTime = (dStr: string) => {
    if (!dStr) return "-";
    const d = new Date(dStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + " " + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 shrink-0" />
          Pencairan & Riwayat Keuangan
        </h1>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium mt-1 sm:mt-2">
          Kelola saldo virtual Anda dari Gateway Instan dan tarik dana ke rekening Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="col-span-1 md:col-span-1 border-blue-200 dark:border-blue-900 shadow-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-blue-100 flex items-center gap-2 text-base sm:text-lg">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" /> Saldo Virtual Anda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-4xl font-bold tracking-tight mb-1 sm:mb-2">
              {formatter.format(saldo)}
            </div>
            <p className="text-blue-200 text-xs sm:text-sm">
              Tersedia untuk dicairkan
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-[#0f172a]">
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-slate-900 dark:text-white text-base sm:text-lg">Informasi Rekening Tujuan</CardTitle>
          </CardHeader>
          <CardContent>
            {bankInfo.bank && bankInfo.noRek ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5 sm:mb-1">Bank</p>
                  <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{bankInfo.bank}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5 sm:mb-1">No. Rekening</p>
                  <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{bankInfo.noRek}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5 sm:mb-1">Atas Nama</p>
                  <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{bankInfo.atasNama}</p>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 p-3 sm:p-4 rounded-xl border border-orange-200 dark:border-orange-900/50 flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Rekening Belum Diatur</h4>
                  <p className="text-xs mt-1">Silakan atur rekening pencairan Anda di menu <b>Pengaturan &gt; Keuangan</b> terlebih dahulu.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tarik" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <TabsTrigger value="tarik" className="rounded-lg font-bold text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a] data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all">
            Tarik Dana
          </TabsTrigger>
          <TabsTrigger value="masuk" className="rounded-lg font-bold text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all">
            Uang Masuk
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tarik" className="mt-6 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-[#0f172a]">
            <CardHeader>
              <CardTitle>Ajukan Pencairan Baru</CardTitle>
              <CardDescription>Minimal penarikan dana adalah Rp 50.000.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTarik} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 max-w-lg">
                <div className="flex-1 space-y-1.5 sm:space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nominal Penarikan</label>
                  <Input 
                    type="number"
                    min="50000"
                    max={saldo}
                    required
                    placeholder="Minimal 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-11 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || saldo < 50000 || !bankInfo.noRek}
                  className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 sm:px-8 w-full sm:w-auto"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tarik Dana"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-[#0f172a]">
            <CardHeader>
              <CardTitle>Riwayat Penarikan Dana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto -mx-1 sm:mx-0">
                <table className="w-full text-sm text-left min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm">Tanggal & Waktu</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm">Nominal</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm">Tujuan</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-right text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0f172a]">
                    {riwayatTarik.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 sm:px-4 py-6 sm:py-8 text-center text-slate-500 text-sm">Belum ada riwayat penarikan dana.</td>
                      </tr>
                    ) : riwayatTarik.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm">{formatDateTime(r.createdAt)}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{formatter.format(r.jumlah)}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{r.bank} - {r.noRekening}</span>
                            <span className="text-xs text-slate-500">{r.atasNama}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            r.status === 'PROCESSED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            r.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="masuk" className="mt-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-[#0f172a]">
            <CardHeader>
              <CardTitle>Riwayat Uang Masuk (Gateway Instan)</CardTitle>
              <CardDescription>Semua pembayaran yang telah dilunasi pelanggan melalui sistem kami.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto -mx-1 sm:mx-0">
                <table className="w-full text-sm text-left min-w-[400px]">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm">Waktu Masuk</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm">ID Transaksi</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-right text-xs sm:text-sm">Nominal (Bersih)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0f172a]">
                    {riwayatMasuk.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 sm:px-4 py-6 sm:py-8 text-center text-slate-500 text-sm">Belum ada uang masuk.</td>
                      </tr>
                    ) : riwayatMasuk.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm">{formatDateTime(r.createdAt)}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">TRX-{r.id}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                          + {formatter.format(r.jumlah)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
