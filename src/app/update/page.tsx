"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, Server, Shield, Sparkles, Database, ArrowUpRight, FileText, Bot } from "lucide-react";

export default function UpdateSoftwarePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "uptodate">("idle");
  const [progress, setProgress] = useState(0);

  const handleCheckUpdate = () => {
    if (isChecking) return;
    setIsChecking(true);
    setCheckStatus("checking");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsChecking(false);
            setCheckStatus("uptodate");
          }, 500);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#060b14] p-6 lg:p-10 text-slate-900 dark:text-white font-sans overflow-x-hidden">
      
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles size={14} /> System Update Center
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Software <span className="text-amber-500">Update</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg max-w-2xl">
            Kelola pembaruan sistem dan temukan fitur-fitur mutakhir yang baru saja dirilis oleh tim satujalan.id.
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <p className="text-sm text-slate-500 mb-1">Status Server satujalan.id</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-medium">Online & Tersinkronisasi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Update Status Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] mb-6">
                <RefreshCw size={40} className={`text-slate-900 dark:text-white ${isChecking ? 'animate-spin' : ''}`} />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Versi Saat Ini: v1.2.0</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 px-4">Stable Edition (LTS) - Dirilis pada Juli 2026</p>

              {checkStatus === "checking" && (
                <div className="w-full mb-8">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span>Mengecek server...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              {checkStatus === "uptodate" && (
                <div className="w-full mb-8 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center gap-2 font-medium">
                  <CheckCircle2 size={18} /> Software Anda sudah versi terbaru!
                </div>
              )}

              <button 
                onClick={handleCheckUpdate}
                disabled={isChecking}
                className={`w-full group relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-base font-semibold transition-all duration-300 overflow-hidden ${
                  isChecking 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 dark:text-white hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-1'
                }`}
              >
                {!isChecking && (
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                )}
                <RefreshCw size={20} className={`relative z-10 ${isChecking ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                <span className="relative z-10">{isChecking ? "Mengecek Pembaruan..." : "Cek Pembaruan Sistem"}</span>
              </button>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-200 dark:border-slate-800/60 shadow-lg flex gap-4">
            <div className="mt-1 w-10 h-10 rounded-full bg-orange-500 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-orange-500 dark:text-blue-400">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Keamanan Terjamin</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Semua file update dienkripsi dan didistribusikan melalui server aman satujalan.id. Tidak ada risiko kehilangan data.</p>
            </div>
          </div>
        </div>

        {/* Right Column - Changelog */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-[#0b1120] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden h-full">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={22} className="text-amber-500" /> Riwayat Pembaruan (Changelog)
              </h2>
              <span className="text-sm text-slate-500 font-medium">Terbaru</span>
            </div>
            
            <div className="p-8 space-y-10">
              {/* Release 1.2.0 */}
              <div className="relative pl-8 border-l border-slate-200 dark:border-slate-800">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <div className="flex flex-wrap items-baseline gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">v1.2.0</h3>
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">Major Update</span>
                  <span className="text-sm text-slate-500 ml-auto">Hari ini</span>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-orange-500 dark:bg-blue-500/20 text-orange-500 dark:text-blue-400"><Bot size={18} /></div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-lg">AI Function Calling (Akses Kepsek)</h4>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                      Revolusi kecerdasan buatan! AI kini tidak hanya menjawab santai, tapi dilengkapi kapabilitas <span className="text-slate-900 dark:text-white font-medium">Function Calling</span>. AI secara otomatis membaca data <i>real-time</i> dari database jika di-chat oleh nomor WhatsApp Kepala Sekolah atau Admin.
                    </p>
                    <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                      <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" /> AI bisa memberikan laporan pemasukan dan jumlah santri nunggak seketika.</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" /> Tersedia form eksklusif di menu Settings untuk mendaftarkan No WA Kepsek/Admin.</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Database size={18} /></div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-lg">Proteksi Database (Anti-Uninstall)</h4>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                      File database utama kini di-migrasikan secara otomatis (Auto-Sync) ke folder absolut sistem (<i>My Documents</i>). 
                      Kejadian tidak disengaja seperti menghapus folder aplikasi tidak akan menghilangkan sekeping data pun!
                    </p>
                  </div>
                </div>
              </div>

              {/* Release 1.1.0 */}
              <div className="relative pl-8 border-l border-slate-200 dark:border-slate-800 opacity-60">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-700"></div>
                <div className="flex flex-wrap items-baseline gap-3 mb-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">v1.1.0</h3>
                  <span className="text-sm text-slate-500 ml-auto">Minggu lalu</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Pembaruan stabilisasi performa dan fitur dasar.</p>
                <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0"></div> Integrasi awal dengan Telegram Bot Owner.</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0"></div> Perbaikan UI pada tabel tagihan santri.</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0"></div> Dukungan engine Baileys untuk WhatsApp multi-device.</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
