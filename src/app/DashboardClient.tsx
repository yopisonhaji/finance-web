"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, FileText, Wallet, KeyRound, Bot, MessageSquareShare } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAppConfig } from "@/contexts/AppConfigContext"
import { useState, useEffect } from "react"
import { getDashboardStats } from "@/app/actions/dashboard"

interface DashboardClientProps {
  hasAiKey: boolean;
  hasIpaymuKey: boolean;
  isWaActive: boolean;
}

export function DashboardClient({ hasAiKey, hasIpaymuKey, isWaActive }: DashboardClientProps) {
  const { t } = useLanguage()
  const { clientTerm, paymentMode } = useAppConfig()
  const [stats, setStats] = useState({
    totalSantri: 0,
    totalKekurangan: 0,
    pemasukanHariIni: 0,
    persentase: 0,
    lunasCount: 0,
    nunggakCount: 0
  })

  useEffect(() => {
    async function fetchStats() {
      const res = await getDashboardStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* 4 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Santri */}
        <Card className="bg-[var(--color-dash-panel)] border-slate-300 dark:border-slate-700/50 hover:border-orange-500 dark:border-blue-400/20 hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium font-medium">Total {clientTerm}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.totalSantri}</span>
                <span className="text-[10px] text-slate-700 font-medium">{clientTerm}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Kekurangan */}
        <Card className="bg-[var(--color-dash-panel)] border-slate-300 dark:border-slate-700/50 hover:border-orange-500 dark:border-blue-400/20 hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium font-medium">{t("dashboard.total_shortage") || "Total Kekurangan"}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Rp {stats.totalKekurangan.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Saldo Virtual / Status Keuangan */}
        <Card className="bg-[var(--color-dash-panel)] border-slate-300 dark:border-slate-700/50 hover:border-orange-500 dark:border-blue-400/20 hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full border transition-colors ${paymentMode === 'PRIVATE' ? 'bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20' : 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20'}`}>
              {paymentMode === 'PRIVATE' ? (
                <KeyRound className="w-5 h-5 text-blue-400" />
              ) : (
                <Wallet className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {paymentMode === 'PRIVATE' ? "Status Keuangan" : "Total Saldo Virtual"}
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                {paymentMode === 'PRIVATE' ? (
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Terhubung ke iPaymu Pribadi</span>
                ) : (
                  <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Rp {stats.pemasukanHariIni.toLocaleString('id-ID')}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tingkat Pelunasan */}
        <Card className="bg-[var(--color-dash-panel)] border-slate-300 dark:border-slate-700/50 hover:border-orange-500 dark:border-blue-400/20 hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 dark:bg-blue-500/10 border border-orange-500 dark:border-blue-500/20 group-hover:bg-orange-500 dark:bg-blue-500/20 transition-colors">
              <svg className="absolute w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-700/50" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="100" strokeDashoffset={100 - stats.persentase} className="text-orange-600 dark:text-blue-500 transition-all duration-700" />
              </svg>
              <span className="text-[10px] font-bold text-orange-500 dark:text-blue-400">{stats.persentase}%</span>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium font-medium">{t("dashboard.payment_rate") || "Tingkat Pelunasan"}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.persentase}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Kiri: Status Tagihan Keseluruhan (Donut Chart) */}
        <Card className="xl:col-span-3 bg-[var(--color-dash-panel)] border-slate-300 dark:border-slate-700/50 flex flex-col h-[400px] hover:border-slate-600/50 transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 pb-3 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t("dashboard.bill_status")}</h3>
          </div>
          <CardContent className="p-5 flex-1 flex flex-col items-center justify-center gap-8">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="80" cy="80" r="60" stroke="#f43f5e" strokeWidth="20" fill="transparent" />
                 <circle cx="80" cy="80" r="60" stroke="#10b981" strokeWidth="20" fill="transparent" strokeDasharray="377" strokeDashoffset={377 - (377 * stats.persentase / 100)} className="transition-all duration-700 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium font-medium">Total {clientTerm}</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{stats.totalSantri}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700/50 cursor-default">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{t("reports.paid_status")}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{stats.persentase}% ({stats.lunasCount})</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700/50 cursor-default">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{t("dashboard.unpaid")}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{100 - stats.persentase}% ({stats.nunggakCount})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tengah: Daftar Tunggakan Teratas */}
        <Card className="xl:col-span-6 bg-[var(--color-dash-panel)] border-slate-300 dark:border-slate-700/50 flex flex-col min-h-[400px] transition-all hover:border-slate-600/50">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 pb-3 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" />
              {t("dashboard.top_arrears")}
            </h3>
          </div>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[500px]">
                <thead className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 whitespace-nowrap">
                  <tr>
                    <th className="px-5 py-3 font-medium">Nama {clientTerm}</th>
                    <th className="px-5 py-3 font-medium">{clientTerm === "Siswa" ? "Wali/Orang Tua" : "Penanggung Jawab"}</th>
                    <th className="px-5 py-3 font-medium">{t("dashboard.arrears")}</th>
                    <th className="px-5 py-3 font-medium text-right">{t("dashboard.status")}</th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* Empty State Keren, Ringan */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative w-16 h-16 mb-4 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-[pulse_4s_infinite]">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">Alhamdulillah, Semua Lunas!</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium max-w-[200px]">Tidak ada satupun {clientTerm.toLowerCase()} yang menunggak bulan ini.</p>
            </div>
          </CardContent>
        </Card>

        {/* Kanan: Riwayat Transaksi & Status Layanan */}
        <div className="xl:col-span-3 flex flex-col gap-6 min-h-[400px]">
          <Card className="bg-[var(--color-dash-panel)] border-slate-300 dark:border-slate-700/50 flex flex-col flex-1 hover:border-slate-600/50 transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 pb-3 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-orange-500 dark:text-blue-400" />
                {t("reports.recent_tx")}
              </h3>
            </div>
            <CardContent className="p-5 flex flex-col items-center justify-center h-full text-sm text-slate-700 relative overflow-hidden">
              <span className="relative z-10">{t("reports.no_tx_data") || "Belum ada riwayat transaksi bulan ini."}</span>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-dash-panel)] border-slate-300 dark:border-slate-700/50 flex flex-col shrink-0 pb-1">
            <div className="p-5 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t("dashboard.service_status")}</h3>
            </div>
            <CardContent className="px-5 pb-4 space-y-3">
              {/* WA Status & Pairing Code */}
              <div className={`group flex flex-col gap-3 p-3 rounded-xl border transition-colors ${isWaActive ? 'bg-teal-500/10 border-teal-500/20' : 'bg-slate-100 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isWaActive ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700/50 text-slate-700'}`}>
                    <MessageSquareShare className="w-4 h-4 relative z-10" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${isWaActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>{t("dashboard.wa_notif")}</h4>
                    <p className={`text-[10px] flex items-center gap-1 ${isWaActive ? 'text-teal-400' : 'text-slate-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isWaActive ? 'bg-teal-400 animate-status-pulse' : 'bg-slate-600'}`}></span> 
                      {isWaActive ? (t("dashboard.module_ready") || 'Modul Terhubung & Siap') : (t("wa.disconnected") || 'Mesin WA Terputus')}
                    </p>
                  </div>
                </div>
                {!isWaActive && (
                  <div className="mt-2 flex flex-col gap-2">
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Silakan tautkan nomor via Terminal Golang</p>
                    <a href="/wa" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 dark:ring-blue-500 disabled:pointer-events-none disabled:opacity-80 bg-orange-600 dark:bg-blue-600 text-white shadow hover:bg-orange-600 dark:bg-blue-600/90 h-9 px-4 py-2 w-full">
                      Buka Terminal WhatsApp
                    </a>
                  </div>
                )}
              </div>
              
              {/* AI Status */}
              <div className={`group flex items-center gap-3 p-3 rounded-xl border transition-colors ${hasAiKey ? 'bg-purple-500/10 border-purple-500/20' : 'bg-slate-100 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700/50'}`}>
                <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${hasAiKey ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-700'}`}>
                  <Bot className="w-4 h-4 relative z-10" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${hasAiKey ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>{t("dashboard.cs_bot")}</h4>
                  <p className={`text-[10px] flex items-center gap-1 ${hasAiKey ? 'text-purple-400' : 'text-slate-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasAiKey ? 'bg-purple-400 animate-status-pulse' : 'bg-slate-600'}`}></span> 
                    {hasAiKey ? (t("dashboard.standby") || 'API Aktif (Standby 24 Jam)') : (t("settings.api_unset") || 'API Key Belum Diatur')}
                  </p>
                </div>
              </div>

              {/* Payment Gateway Status */}
              <div className={`group flex items-center gap-3 p-3 rounded-xl border transition-colors ${hasIpaymuKey ? 'bg-orange-500 dark:bg-blue-500/10 border-orange-500 dark:border-blue-500/20' : 'bg-slate-100 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700/50'}`}>
                <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${hasIpaymuKey ? 'bg-orange-500 dark:bg-blue-500/20 text-orange-500 dark:text-blue-400' : 'bg-slate-700/50 text-slate-700'}`}>
                  <Wallet className="w-4 h-4 relative z-10" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${hasIpaymuKey ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>{t("settings.tab_payment") || 'Payment Gateway'}</h4>
                  <p className={`text-[10px] flex items-center gap-1 ${hasIpaymuKey ? 'text-orange-500 dark:text-blue-400' : 'text-slate-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasIpaymuKey ? 'bg-blue-400 animate-status-pulse' : 'bg-slate-600'}`}></span> 
                    {hasIpaymuKey ? (t("pos.ipaymu") || 'iPaymu Siap Menerima Dana') : (t("settings.api_unset") || 'Belum Dikonfigurasi')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}




