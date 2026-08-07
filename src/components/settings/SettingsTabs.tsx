"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Save, Eye, EyeOff, Lock, Unlock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { saveSettings } from "@/server/settings"
import { useLanguage } from "@/contexts/LanguageContext"

const settingsSchema = z.object({
  TIPE_BISNIS: z.string().optional().or(z.literal("")),
  nama_pesantren: z.string().min(2, { message: "Nama terlalu pendek" }),
  alamat: z.string().min(5, { message: "Alamat terlalu pendek" }),
  OWNER_NAMA: z.string().optional().or(z.literal("")),
  OWNER_WA: z.string().optional().or(z.literal("")),
  KEPSEK_WA: z.string().optional().or(z.literal("")),
  ADMIN_WA: z.string().optional().or(z.literal("")),
  ipaymu_va: z.string(),
  ipaymu_key: z.string(),
  deepseek_key: z.string(),
  ai_prompt: z.string().optional().or(z.literal("")),
  usage_token: z.string().optional(),
  limit_token: z.string().optional(),
  masa_aktif: z.string().optional(),
  ai_model: z.string().optional(),
  ai_target_reply: z.string().optional().or(z.literal("all")),
  wa_bot_url: z.string().optional().or(z.literal("")),
  wa_bot_token: z.string().optional().or(z.literal("")),

  spp_reminder_day: z.string().optional().or(z.literal("")),
  spp_reminder_time: z.string().optional().or(z.literal("")),
  spp_reminder_template: z.string().optional().or(z.literal("")),
  spp_early_reminder_day: z.string().optional().or(z.literal("")),
  spp_early_reminder_time: z.string().optional().or(z.literal("")),
  spp_early_reminder_template: z.string().optional().or(z.literal("")),
})

export function SettingsTabs({ initialData }: { initialData: Record<string, string> }) {
  const [loading, setLoading] = useState(false)
  const [showIpaymuKey, setShowIpaymuKey] = useState(false)
  const [showAiKey, setShowAiKey] = useState(false)
  const [showTelegramKey, setShowTelegramKey] = useState(false)
  const [showWaToken, setShowWaToken] = useState(false)
  const [lockIpaymu, setLockIpaymu] = useState(true)
  const [showIpaymuVa, setShowIpaymuVa] = useState(false)
  const [lockIpaymuVa, setLockIpaymuVa] = useState(true)
  const [lockAi, setLockAi] = useState(true)
  const [lockTelegram, setLockTelegram] = useState(true)
  const [lockWa, setLockWa] = useState(true)
  const { t } = useLanguage()

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      TIPE_BISNIS: initialData.TIPE_BISNIS || "PENDIDIKAN",
      nama_pesantren: initialData.nama_pesantren || "Pesantren Darul Ulum",
      alamat: initialData.alamat || "Jl. Pesantren No.1",
      OWNER_NAMA: initialData.OWNER_NAMA || "",
      OWNER_WA: initialData.OWNER_WA || "",
      KEPSEK_WA: initialData.KEPSEK_WA || "",
      ADMIN_WA: initialData.ADMIN_WA || "",
      ipaymu_va: initialData.ipaymu_va || "",
      ipaymu_key: initialData.ipaymu_key || "",
      deepseek_key: initialData.deepseek_key || "",
      ai_prompt: initialData.ai_prompt || "",
      usage_token: initialData.usage_token || "0",
      limit_token: initialData.limit_token || "0",
      masa_aktif: initialData.masa_aktif || "Belum Diset",
      ai_model: initialData.ai_model || "deepseek-chat",
      ai_target_reply: initialData.ai_target_reply || "all",
      wa_bot_url: initialData.wa_bot_url || "",
      wa_bot_token: initialData.wa_bot_token || "",

      spp_reminder_day: initialData.spp_reminder_day || "Setiap Hari",
      spp_reminder_time: initialData.spp_reminder_time || "07:00",
      spp_reminder_template: initialData.spp_reminder_template || "Assalamu'alaikum Bapak/Ibu {{nama_wali}},\n\nKami dari Bagian Keuangan {{nama_pesantren}} mengingatkan bahwa terdapat tagihan SPP bulanan yang belum lunas untuk ananda *{{nama_santri}}* (Kelas {{kelas_santri}}).\n\nMohon untuk segera menyelesaikan pembayaran di loket kasir atau via transfer.\n\nWassalamu'alaikum Wr. Wb.",
      spp_early_reminder_day: initialData.spp_early_reminder_day || "7",
      spp_early_reminder_time: initialData.spp_early_reminder_time || "07:00",
      spp_early_reminder_template: initialData.spp_early_reminder_template || "Assalamu'alaikum Bapak/Ibu {{nama_wali}},\n\nKami dari {{nama_pesantren}} mengingatkan bahwa SPP bulanan ananda *{{nama_santri}}* akan segera jatuh tempo dalam waktu dekat.\n\nMohon persiapkan pembayarannya. Abaikan pesan ini jika sudah lunas.\n\nWassalamu'alaikum Wr. Wb.",
    },
  })

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setLoading(true)
    
    // PENTING: Jangan kirim variabel yang dikelola oleh Bot Telegram
    // agar tidak tertimpa dengan nilai kosong atau nilai lama saat form disave
    const { 
      deepseek_key, 
      usage_token, 
      limit_token, 
      masa_aktif, 
      ai_model, 
      ...safeValues 
    } = values
    
    const res = await saveSettings(safeValues)
    if (res.success) {
      alert(t('settings.save_success') || "Pengaturan berhasil disimpan!")
      window.location.reload()
    } else {
      alert((t('settings.save_error') || "Gagal menyimpan: ") + res.message)
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="umum" className="w-full flex-col">
          <TabsList className="flex flex-nowrap md:grid md:grid-cols-4 h-auto w-full mb-6 bg-white dark:bg-[#0f172a] gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto overflow-y-hidden snap-x scrollbar-hide justify-start">
            <TabsTrigger value="umum" className="shrink-0 min-w-[140px] md:w-full py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white data-active:bg-orange-600 dark:bg-blue-600 data-active:text-white data-active:shadow-[0_0_15px_rgba(37,99,235,0.5)] data-active:border-orange-500 dark:border-blue-500 border border-transparent transition-all whitespace-nowrap h-full text-xs sm:text-sm snap-center">{t("settings.tab_general")}</TabsTrigger>
            <TabsTrigger value="keuangan" className="shrink-0 min-w-[140px] md:w-full py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white data-active:bg-orange-600 dark:bg-blue-600 data-active:text-white data-active:shadow-[0_0_15px_rgba(37,99,235,0.5)] data-active:border-orange-500 dark:border-blue-500 border border-transparent transition-all whitespace-nowrap h-full text-xs sm:text-sm snap-center">{t("settings.tab_payment")}</TabsTrigger>
            <TabsTrigger value="ai" className="shrink-0 min-w-[140px] md:w-full py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white data-active:bg-orange-600 dark:bg-blue-600 data-active:text-white data-active:shadow-[0_0_15px_rgba(37,99,235,0.5)] data-active:border-orange-500 dark:border-blue-500 border border-transparent transition-all whitespace-nowrap h-full text-xs sm:text-sm snap-center">{t("settings.tab_ai")}</TabsTrigger>
            <TabsTrigger value="penagihan" className="shrink-0 min-w-[140px] md:w-full py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white data-active:bg-orange-600 dark:bg-blue-600 data-active:text-white data-active:shadow-[0_0_15px_rgba(37,99,235,0.5)] data-active:border-orange-500 dark:border-blue-500 border border-transparent transition-all whitespace-nowrap h-full text-xs sm:text-sm snap-center">{t("settings.tab_billing")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="umum">
            <Card className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl">
              <CardHeader>
                <CardTitle>{t("settings.general_title")}</CardTitle>
                <CardDescription>
                  {t('settings.general_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="OWNER_NAMA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">{t('settings.owner_name')} <Lock size={12} className="text-slate-700" /></FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium cursor-not-allowed border-slate-300 dark:border-slate-700/50 focus-visible:ring-0" title={t('settings.permanent_data')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="OWNER_WA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">{t('settings.owner_wa')} <Lock size={12} className="text-slate-700" /></FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium cursor-not-allowed border-slate-300 dark:border-slate-700/50 focus-visible:ring-0" title={t('settings.permanent_data')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="TIPE_BISNIS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Bisnis Aplikasi</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-80 text-slate-900 dark:text-white"
                        >
                          <option value="PENDIDIKAN">Institusi Pendidikan (Siswa)</option>
                          <option value="PERUSAHAAN">Perusahaan / Bisnis Umum (Pelanggan/Klien)</option>
                        </select>
                      </FormControl>
                      <FormDescription>Pilihan ini akan mengubah istilah tagihan dan laporan secara otomatis di seluruh aplikasi.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="KEPSEK_WA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.principal_wa')}</FormLabel>
                        <FormControl>
                          <Input placeholder="628xxx" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-700 h-11" />
                        </FormControl>
                        <FormDescription>{t('settings.principal_desc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ADMIN_WA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.admin_wa')}</FormLabel>
                        <FormControl>
                          <Input placeholder="628xxx" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-700 h-11" />
                        </FormControl>
                        <FormDescription>{t('settings.admin_desc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="nama_pesantren"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.school_name')}</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alamat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.school_address')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keuangan">
            <Card className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl">
              <CardHeader>
                <CardTitle>{t('settings.ipaymu_title')}</CardTitle>
                <CardDescription>
                  {t('settings.ipaymu_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="ipaymu_va"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.ipaymu_va')}</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <Input 
                            type={showIpaymuVa ? "text" : "password"} 
                            placeholder="0000000000000000" 
                            {...field} 
                            readOnly={lockIpaymuVa}
                            className={`h-11 pr-20 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 ${lockIpaymuVa ? 'opacity-70 bg-slate-100 dark:bg-slate-800/80' : 'bg-white dark:bg-slate-900'}`} 
                          />
                          <div className="absolute right-2 flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => setShowIpaymuVa(!showIpaymuVa)}
                              className="p-1.5 text-muted-foreground hover:text-foreground"
                            >
                              {showIpaymuVa ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setLockIpaymuVa(!lockIpaymuVa)}
                              className={`p-1.5 ${lockIpaymuVa ? 'text-red-400' : 'text-green-400'} hover:opacity-80`}
                              title={lockIpaymuVa ? "Buka Kunci untuk Mengedit" : "Kunci Kembali"}
                            >
                              {lockIpaymuVa ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ipaymu_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.ipaymu_key')}</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <Input 
                            type={showIpaymuKey ? "text" : "password"} 
                            {...field} 
                            readOnly={lockIpaymu}
                            className={`h-11 pr-20 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 ${lockIpaymu ? 'opacity-70 bg-slate-100 dark:bg-slate-800/80' : 'bg-white dark:bg-slate-900'}`} 
                          />
                          <div className="absolute right-2 flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => setShowIpaymuKey(!showIpaymuKey)}
                              className="p-1.5 text-muted-foreground hover:text-foreground"
                            >
                              {showIpaymuKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setLockIpaymu(!lockIpaymu)}
                              className={`p-1.5 ${lockIpaymu ? 'text-red-400' : 'text-green-400'} hover:opacity-80`}
                              title={lockIpaymu ? "Buka Kunci untuk Mengedit" : "Kunci Kembali"}
                            >
                              {lockIpaymu ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>{t('settings.ipaymu_secret')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>


          </TabsContent>

          <TabsContent value="ai">
            <Card className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl mb-6">
              <CardHeader className="bg-emerald-500/5 pb-4">
                <CardTitle className="text-emerald-500 flex items-center">{t('settings.ai_status_title')}</CardTitle>
                <CardDescription>{t('settings.ai_status_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">{t('settings.api_status')}</p>
                    <p className={`text-xl font-bold ${initialData.deepseek_key ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {initialData.deepseek_key ? t('settings.api_active') : t('settings.api_unset')}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">{t('settings.token_used')}</p>
                    <p className="text-xl font-bold text-orange-500 dark:text-blue-400">
                      {Number(initialData.usage_token || 0).toLocaleString()} <span className="text-sm font-normal text-slate-700">Token</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">{t('settings.token_limit')}</p>
                    <p className="text-xl font-bold text-amber-400">
                      {Number(initialData.limit_token || 0) > 0 ? Number(initialData.limit_token || 0).toLocaleString() : t('settings.unlimited')}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">Masa Aktif</p>
                    <p className="text-xl font-bold text-indigo-400">
                      {initialData.masa_aktif || "Belum Diset"}
                    </p>
                  </div>
                </div>
                {Number(initialData.limit_token || 0) > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">
                      <span>{t('settings.usage_percentage')}</span>
                      <span>{Math.min(100, Math.round((Number(initialData.usage_token || 0) / Number(initialData.limit_token || 1)) * 100))}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 dark:bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min(100, Math.round((Number(initialData.usage_token || 0) / Number(initialData.limit_token || 1)) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <p>{t('settings.token_empty')}</p>
                  </div>
                  <a 
                    href="https://wa.me/6282138004443?text=Halo%20Admin,%20saya%20ingin%20Top%20Up%20Token%20AI%20untuk%20Aplikasi%20Finance%20saya." 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {t('settings.topup')}
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-primary flex items-center">{t('settings.ai_brain_title')}</CardTitle>
                <CardDescription>
                  {t('settings.ai_brain_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="deepseek_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.ai_api')}</FormLabel>
                      <FormControl>
                        <div>
                          <Input type="hidden" {...field} />
                          <div className={`flex items-center justify-between p-3 rounded-lg border ${initialData.deepseek_key ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                            <div className="flex items-center gap-2 font-medium">
                              {initialData.deepseek_key ? t('settings.ai_api_active') : t('settings.ai_api_unset')}
                            </div>
                            <Lock size={16} className="opacity-70 text-red-400" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ai_prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.system_prompt')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="h-32 border-primary/30"
                          placeholder="Beri tahu AI bagaimana dia harus bersikap..."
                        />
                      </FormControl>
                      <FormDescription>
                        {t('settings.prompt_desc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ai_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-400">Model AI</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80 text-slate-900 dark:text-white"
                        >
                          <option value="deepseek-chat">DeepSeek Chat (Lebih Cepat)</option>
                          <option value="deepseek-reasoner">DeepSeek Reasoner (Lebih Cerdas R1)</option>
                        </select>
                      </FormControl>
                      <FormDescription>Pilih model kecerdasan buatan yang digunakan.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ai_target_reply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-400">{t('settings.target_reply')}</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80 text-slate-900 dark:text-white"
                        >
                          <option value="all">{t('settings.reply_all')}</option>
                          <option value="unsaved_only">{t('settings.reply_unsaved')}</option>
                        </select>
                      </FormControl>
                      <FormDescription>{t('settings.reply_desc')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="wa_bot_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.wa_url')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('settings.url_placeholder') || "Contoh: http://localhost:8000/send"} {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-700 h-11" />
                        </FormControl>
                        <FormDescription>{t('settings.wa_url_desc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wa_bot_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.wa_token')}</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input 
                              type={showWaToken ? "text" : "password"} 
                              placeholder={t('settings.token_placeholder') || "Token keamanan (opsional)"} 
                              {...field} 
                              readOnly={lockWa}
                              className={`h-11 pr-20 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 ${lockWa ? 'opacity-70 bg-slate-100 dark:bg-slate-800/80' : 'bg-white dark:bg-slate-900'}`} 
                            />
                            <div className="absolute right-2 flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => setShowWaToken(!showWaToken)}
                                className="p-1.5 text-muted-foreground hover:text-foreground"
                              >
                                {showWaToken ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setLockWa(!lockWa)}
                                className={`p-1.5 ${lockWa ? 'text-red-400' : 'text-green-400'} hover:opacity-80`}
                                title={lockWa ? "Buka Kunci untuk Mengedit" : "Kunci Kembali"}
                              >
                                {lockWa ? <Lock size={16} /> : <Unlock size={16} />}
                              </button>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>{t('settings.wa_token_desc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="penagihan">
            <div className="space-y-6">
              {/* PENGINGAT AWAL */}
              <Card className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl">
                <CardHeader className="bg-orange-500 dark:bg-blue-500/5 pb-4">
                  <CardTitle className="text-orange-500 dark:text-blue-400">{t('settings.early_reminder_title')}</CardTitle>
                  <CardDescription>{t('settings.early_reminder_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="spp_early_reminder_day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.reminder_date')}</FormLabel>
                          <FormControl>
                            <select 
                              {...field}
                              className="flex h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-80 text-slate-900 dark:text-white"
                            >
                              {[...Array(31)].map((_, i) => (
                                <option key={i+1} value={(i+1).toString()}>{t('settings.date')} {i+1}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormDescription>{t('settings.early_date_desc')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="spp_early_reminder_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.send_time')}</FormLabel>
                          <FormControl>
                            <Input type="time" className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-11 block w-full" {...field} />
                          </FormControl>
                          <FormDescription>{t('settings.time_desc')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="spp_early_reminder_template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.early_template')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[120px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {t('settings.template_vars')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* PENAGIHAN TUNGGAKAN */}
              <Card className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl mb-6">
                <CardHeader className="bg-rose-500/5 pb-4">
                  <CardTitle className="text-rose-500">{t('settings.arrears_title')}</CardTitle>
                  <CardDescription>{t('settings.arrears_desc')}</CardDescription>
                </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="spp_reminder_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.arrears_date')}</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="flex h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-80 text-slate-900 dark:text-white"
                          >
                            <option value="Setiap Hari">{t('settings.every_day')}</option>
                            {[...Array(31)].map((_, i) => (
                              <option key={i+1} value={(i+1).toString()}>{t('settings.every') || "Setiap"} {t('settings.date')} {i+1}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormDescription>{t('settings.arrears_date_desc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spp_reminder_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.arrears_time')}</FormLabel>
                        <FormControl>
                          <Input type="time" className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-11 block w-full" {...field} />
                        </FormControl>
                        <FormDescription>{t('settings.time_desc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="spp_reminder_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.wa_template')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[150px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {t('settings.template_vars')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8 pb-10">
          <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto shadow-lg shadow-primary/20">
            {loading ? t("pos.processing") : (
              <>
                <Save className="mr-2 h-5 w-5 rtl:ms-2 rtl:mr-0" />
                {t("settings.save")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}




