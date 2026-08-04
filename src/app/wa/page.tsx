"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, RefreshCcw, Wifi, WifiOff, LogOut, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requestWaPairing } from "@/server/wa"

export default function StatusWAPage() {
  const [status, setStatus] = useState<string>("disconnected")
  const [phone, setPhone] = useState<string>("")
  const [inputPhone, setInputPhone] = useState<string>("")
  const [pairingCode, setPairingCode] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/wa/status")
      const data = await res.json()
      setStatus(data.status || "disconnected")
      setPhone(data.phone || "")
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
      const res = await requestWaPairing(inputPhone);
      if (res.success && res.code) {
        setPairingCode(res.code);
      } else {
        alert(res.message || "Gagal meminta kode");
      }
    } catch (e) {
      alert("Gagal memanggil server action");
    }
    setLoading(false);
  }

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Connect to SSE for real-time updates
    const eventSource = new EventSource("http://localhost:8080/api/events")
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        if (parsed.type === 'connected') {
          fetchStatus() // refresh status
        } else if (parsed.type === 'disconnected') {
          setStatus('disconnected')
          setPhone('')
        } else if (parsed.type === 'message_sent') {
          console.log("Pesan berhasil terkirim via queue:", parsed.data)
        }
      } catch(e) {}
    }

    eventSource.onerror = () => {
      console.log("SSE Connection lost. Retrying...")
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Terminal WhatsApp</h1>
        <p className="text-slate-400 mt-2">
          Hubungkan sistem dengan WhatsApp menggunakan metode modern (Pairing Code).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Kiri: Form Pairing */}
        <Card className="border-slate-800 shadow-xl bg-[#0f172a]">
          <CardHeader className="bg-blue-900/10 pb-4 border-b border-slate-800">
            <CardTitle className="flex items-center text-blue-400">
              <Smartphone className="mr-2 h-5 w-5" />
              Tautkan Perangkat
            </CardTitle>
            <CardDescription>
              Tanpa perlu kamera. Masukkan nomor Anda untuk mendapatkan 8 digit kode keamanan.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {status === "connected" ? (
              <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 py-8">
                <div className="h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold">Terhubung Secara Aman</h3>
                <p className="text-sm mt-2 font-medium">WhatsApp siap membalas otomatis 24/7</p>
              </div>
            ) : pairingCode ? (
              <div className="flex flex-col items-center py-6">
                <p className="text-sm text-slate-500 mb-4 font-medium text-center">
                  Buka WhatsApp di HP Anda &gt; Perangkat Taut &gt; Tautkan dengan Nomor Telepon. Lalu masukkan kode ini:
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-8 py-6 shadow-inner w-full flex justify-center">
                  <span className="text-4xl font-mono font-bold tracking-[0.25em] text-blue-600 dark:text-blue-400">
                    {pairingCode}
                  </span>
                </div>
                <Button variant="ghost" className="mt-6" onClick={() => setPairingCode("")}>Batal</Button>
              </div>
            ) : (
              <form onSubmit={handlePairing} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Nomor WhatsApp Bot</label>
                  <Input 
                    type="text" 
                    placeholder="Contoh: 628123456789 (Gunakan 62)" 
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    className="h-12 text-lg font-medium bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !inputPhone}
                  className="w-full h-12 text-md font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Meminta Kode..." : "Dapatkan Pairing Code"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Panel Kanan: Status Mesin */}
        <Card className="border-slate-800 shadow-xl bg-[#0f172a]">
          <CardHeader>
            <CardTitle className="text-white">Status Mesin Golang</CardTitle>
            <CardDescription className="text-slate-400">Sistem backend ringan & anti-blokir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${status === 'connected' ? 'bg-emerald-900/20 border-emerald-800' : 'bg-rose-900/20 border-rose-800'}`}>
              <div className="flex items-center gap-3">
                {status === "connected" ? <Wifi className="h-6 w-6 text-emerald-500" /> : <WifiOff className="h-6 w-6 text-rose-500" />}
                <div>
                  <h4 className={`font-bold ${status === 'connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {status === 'connected' ? 'Modul Terkoneksi' : 'Menunggu Sesi'}
                  </h4>
                  <p className="text-sm text-slate-400 mt-0.5">Proxy IPRoyal Aktif</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-slate-500">Framework Mesin:</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">Golang (whatsmeow)</div>
                <div className="text-slate-500">Metode Proteksi:</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">Residential SOCKS5</div>
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
