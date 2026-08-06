"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import { Info, ExternalLink, ShieldCheck, FileText, Code, History, LifeBuoy } from "lucide-react"

export function AboutApp() {
  const version = process.env.APP_VERSION || "0.1.2";

  return (
    <div className="flex-1 max-w-md ml-8 relative hidden md:flex items-center group">
      <Dialog>
        <DialogTrigger className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#151c2c] border border-slate-300 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800/80 hover:border-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all shadow-inner">
          <Info className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium">Tentang Aplikasi</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0f172a] text-slate-200 border-slate-300 dark:border-slate-700 p-0 overflow-hidden" showCloseButton={true}>
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 border-b border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Satu Jalan Finance AI
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-semibold border border-indigo-500/30">
                  v{version}
                </span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-md">
                Sistem manajemen keuangan pesantren cerdas berbasis AI. Dirancang khusus untuk mempermudah tata kelola administrasi, transparansi, dan layanan wali santri 24 jam.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-sm">
            {/* Tutorial & Bantuan */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-orange-500 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-orange-500 dark:border-blue-500/20 mt-0.5">
                <LifeBuoy className="w-5 h-5 text-orange-500 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-base">Bantuan & Tutorial</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-1 mb-2">Butuh panduan penggunaan aplikasi, dokumentasi API, atau bantuan teknis?</p>
                <a href="https://satujalan.id/support" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 font-semibold text-sm transition-colors">
                  Hubungi Tim Support <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Changelog */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5">
                <History className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-base">Riwayat Pembaruan (Release Notes)</h4>
                <ul className="text-slate-500 dark:text-slate-400 mt-2 list-disc pl-4 space-y-1.5">
                  <li>Integrasi penuh Bot WhatsApp (CS 24 Jam) menggunakan AI untuk melayani pertanyaan wali santri.</li>
                  <li>Perbaikan stabilitas pada modul kasir dan transaksi iPaymu.</li>
                  <li>Peningkatan keamanan dan performa database.</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/80 my-2"></div>

            {/* Legalitas */}
            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-base">Kebijakan Privasi (Privacy Policy)</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm leading-relaxed">
                    Semua data operasional dan keuangan sekolah disimpan secara aman dan dienkripsi. Kami berkomitmen penuh menjaga kerahasiaan data lembaga pendidikan Anda sesuai standar kepatuhan (compliance) industri. Data Anda tidak akan pernah dijual atau dibagikan ke pihak ketiga tanpa izin eksplisit.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 mt-0.5">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-base">Syarat & Ketentuan (TOS)</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm mb-2">
                    Penggunaan aplikasi ini beserta modul payment gateway dan AI tunduk pada Syarat dan Ketentuan layanan resmi kami. 
                  </p>
                  <a href="https://satujalan.id/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 font-semibold text-sm transition-colors">
                    Baca Syarat & Ketentuan <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center shrink-0 border border-slate-500/20 mt-0.5">
                  <Code className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-base">Lisensi Pihak Ketiga (Open Source Credits)</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                    Aplikasi ini dibangun menggunakan berbagai teknologi dan pustaka open-source terbaik termasuk Next.js, React, Tailwind CSS, Node.js, SQLite, dan Drizzle ORM yang dilindungi oleh lisensi masing-masing (MIT / Apache License 2.0).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 font-semibold tracking-wide">
              © {new Date().getFullYear()} satujalan.id. All rights reserved.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
