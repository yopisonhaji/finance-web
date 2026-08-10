"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, RefreshCcw, Wifi, WifiOff, LogOut, CheckCircle2, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function StatusWAPage() {
  const [status, setStatus] = useState<string>("disconnected")
  const [phone, setPhone] = useState<string>("")
  const [inputPhone, setInputPhone] = useState<string>("")
  const [pairingCode, setPairingCode] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)


  const botUrl = process.env.NEXT_PUBLIC_BOT_URL || "/api-bot";

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(`${botUrl}/api/wa/status?t=${Date.now()}`, { 
        cache: "no-store",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420"
        }
      })
      const data = await res.json()
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
        return;
      }
      
      setStatus(data.status || "disconnected")
      setPhone(data.phone || "")
      setIsPaused(data.paused || false)
    } catch (e) {
      setStatus("disconnected")
    }
  }

  const handlePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone) return;
    
    setLoading(true);
    setPairingCode("");
    try {
      const token = localStorage.getItem("token") || ""
      const response = await fetch(`${botUrl}/api/wa/pairing`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({ phone: inputPhone })
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Vercel Proxy Error:", text);
        alert("Gagal koneksi ke VPS. Server VPS mungkin sibuk atau menolak proxy.");
        setLoading(false);
        return;
      }
      
      if (response.ok && data.code) {
        setPairingCode(data.code);
      } else if (response.status === 401) {
        alert("Sesi Anda telah kadaluarsa karena pembaruan keamanan. Silakan login kembali.");
        localStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
      } else {
        alert(data.error + (data.details ? ` (${data.details})` : ""));
      }
    } catch (e: any) {
      console.error(e);
      alert("Error jaringan: " + e.message);
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      await fetch(`${botUrl}/api/wa/logout`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420"
        }
      });
      setStatus("disconnected");
      setPhone("");
      setIsPaused(false);
    } catch (e) {
      alert("Gagal logout. Pastikan server Go berjalan.");
    }
  }

  const handlePause = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(`${botUrl}/api/wa/pause`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420"
        }
      });
      if (res.ok) setIsPaused(true);
    } catch (e) {
      alert("Gagal pause. Pastikan server Go berjalan.");
    }
  }

  const handleResume = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(`${botUrl}/api/wa/resume`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420"
        }
      });
      if (res.ok) setIsPaused(false);
    } catch (e) {
      alert("Gagal resume. Pastikan server Go berjalan.");
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Poll for status every 3 seconds to update UI automatically
    const interval = setInterval(() => {
      fetchStatus()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Terminal WhatsApp AI</h1>
        <p className="text-slate-700 dark:text-slate-300 font-medium mt-2">
          Hubungkan sistem dengan WhatsApp. Pause, Resume, atau Logout kapan saja.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Kiri: Form Pairing */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-[#0f172a]">
          <CardHeader className="bg-orange-50 dark:bg-blue-900/10 pb-4 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center text-orange-500 dark:text-blue-400">
              <Smartphone className="mr-2 h-5 w-5" />
              Tautkan Perangkat
            </CardTitle>
            <CardDescription>
              Tanpa perlu kamera. Masukkan nomor Anda untuk mendapatkan 8 digit kode keamanan.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {status === "connected" ? (
              <div className="flex flex-col items-center py-8">
                <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-4 ${isPaused ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-emerald-100 dark:bg-emerald-500/10'}`}>
                  {isPaused ? <Pause className="h-12 w-12 text-amber-500" /> : <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <h3 className={`text-xl font-bold ${isPaused ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isPaused ? 'Di-Pause Sementara' : 'Terhubung Secara Aman'}
                </h3>
                <p className="text-sm mt-2 font-medium text-slate-500">
                  {isPaused ? 'Bot tidak akan membalas pesan sampai di-resume.' : phone ? `Koneksi berhasil ke nomor: ${phone}` : 'WhatsApp siap membalas otomatis 24/7'}
                </p>
                <div className="flex gap-3 mt-6">
                  {isPaused ? (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleResume}>
                      <Play className="mr-2 h-4 w-4" /> Lanjutkan (Resume)
                    </Button>
                  ) : (
                    <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white" onClick={handlePause}>
                      <Pause className="mr-2 h-4 w-4" /> Pause Sebentar
                    </Button>
                  )}
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Keluar (Log Out)
                  </Button>
                </div>
              </div>
            ) : pairingCode ? (
              <div className="flex flex-col items-center py-6">
                <p className="text-sm text-slate-700 mb-4 font-medium text-center">
                  Buka WhatsApp di HP Anda &gt; Perangkat Taut &gt; Tautkan dengan Nomor Telepon. Lalu masukkan kode ini:
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-8 py-6 shadow-inner w-full flex justify-center">
                  <span className="text-4xl font-mono font-bold tracking-[0.25em] text-orange-600 dark:text-blue-600 dark:text-blue-400">
                    {pairingCode}
                  </span>
                </div>
                <Button variant="ghost" className="mt-6" onClick={() => setPairingCode("")}>Batal</Button>
              </div>
            ) : (
              <form onSubmit={handlePairing} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nomor WhatsApp Bot</label>
                  <Input 
                    type="text" 
                    placeholder="Contoh: 628123456789 (Gunakan 62)" 
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    className="h-12 text-lg font-medium bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-700 focus:bg-white dark:bg-[#0f172a] focus-visible:ring-orange-500 dark:ring-blue-500"
                    
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !inputPhone}
                  className="w-full h-12 text-md font-bold bg-orange-600 dark:bg-blue-600 hover:bg-orange-700 dark:bg-blue-700 text-white"
                >
                  {loading ? "Meminta Kode..." : "Dapatkan Pairing Code"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Panel Kanan: Status Mesin */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-[#0f172a]">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Status Gateway Sistem</CardTitle>
            <CardDescription className="text-slate-700 dark:text-slate-300 font-medium">Sinkronisasi pesan & antrian real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${status === 'connected' ? 'bg-emerald-900/20 border-emerald-800' : 'bg-rose-900/20 border-rose-800'}`}>
              <div className="flex items-center gap-3">
                {status === "connected" ? <Wifi className="h-6 w-6 text-emerald-500" /> : <WifiOff className="h-6 w-6 text-rose-500" />}
                <div>
                  <h4 className={`font-bold ${status === 'connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {status === 'connected' ? 'Gateway Terhubung' : 'Menunggu Sesi'}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">Koneksi Aman & Stabil</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-slate-700">Arsitektur Core:</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">Enterprise Gateway v2.4</div>
                <div className="text-slate-700">Protokol Keamanan:</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">End-to-End Encryption</div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mt-6">
                <Button variant="outline" className="h-11" onClick={fetchStatus}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Status Server
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
