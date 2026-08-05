"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Fingerprint, User, Phone, Sparkles, Building2, GraduationCap, Mail } from "lucide-react";
import { saveSetupData } from "@/app/actions/setup";
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "@/lib/firebase";
import { useEffect } from "react";

export function SetupScreen() {
  const [nama, setNama] = useState("");
  const [noWa, setNoWa] = useState("");
  const [email, setEmail] = useState("");
  const [firebaseUid, setFirebaseUid] = useState("");
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [tipeBisnis, setTipeBisnis] = useState("PENDIDIKAN");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth!);
        if (result) {
          setEmail(result.user.email || "");
          setNama(result.user.displayName || "");
          setFirebaseUid(result.user.uid);
          setIsGoogleSignedIn(true);
        }
      } catch (err: any) {
        setError("Gagal memproses login: " + err.message);
      }
    };
    checkRedirect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !noWa || !email || !firebaseUid || !tipeBisnis) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    
    setLoading(true);
    setError("");
    const res = await saveSetupData(nama, noWa, email, firebaseUid, tipeBisnis);
    if (res.success) {
      setSuccess(true);
      if (res.tenantId) {
        localStorage.setItem("token", res.tenantId);
        document.cookie = `token=${res.tenantId}; path=/; max-age=864000`;
      }
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      setError("Gagal menyimpan data: " + res.error);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const popupPromise = signInWithPopup(auth!, googleProvider);
      
      setLoading(true);
      setError("");
      
      const result = await popupPromise;
      setEmail(result.user.email || "");
      setNama(result.user.displayName || "");
      setFirebaseUid(result.user.uid);
      setIsGoogleSignedIn(true);
      setLoading(false);
    } catch (err: any) {
      if (err.code === "auth/popup-blocked") {
        setError("Popup diblokir browser, mengalihkan halaman...");
        try {
          await signInWithRedirect(auth!, googleProvider);
        } catch (redirectErr: any) {
          setError("Gagal mengalihkan halaman: " + redirectErr.message);
          setLoading(false);
        }
      } else {
        setError("Gagal login dengan Google: " + err.message);
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] animate-pulse-ring -z-10" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] animate-pulse-ring -z-10" style={{ animationDelay: '2s' }} />

        <Card className="w-full max-w-md border-cyan-200 shadow-2xl bg-white/80 backdrop-blur-xl relative z-10 overflow-hidden flex flex-col items-center py-12">
          <div className="w-20 h-20 mb-6 relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="w-8 h-8 text-cyan-600 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Pendaftaran Berhasil!
          </CardTitle>
          <p className="text-slate-500 font-medium text-center px-6">
            Mohon tunggu sebentar, sedang menyiapkan dan mensinkronisasi dashboard Anda...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sci-Fi Background Elements */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] animate-pulse-ring -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] animate-pulse-ring -z-10" style={{ animationDelay: '2s' }} />

      <Card className="w-full max-w-md border-cyan-200 shadow-2xl bg-white/80 backdrop-blur-xl relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
        
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-2 overflow-hidden border border-slate-200">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Inisialisasi Sistem
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Asisten Chat & Pay AI 24 jam
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-6">
          {!isGoogleSignedIn ? (
            <div className="space-y-5 text-center">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 text-center">
                  {error}
                </div>
              )}
              <p className="text-slate-500 font-medium text-sm mb-4">
                Silakan daftar menggunakan akun Google Anda untuk memulai.
              </p>
              <Button 
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 font-bold tracking-wide shadow-md border border-slate-200 transition-all flex items-center justify-center gap-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Daftar dengan Google
                  </>
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 text-center">
                  {error}
                </div>
              )}
              
              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{nama}</p>
                  <p className="text-xs text-slate-500">{email}</p>
                </div>
              </div>
              
              <div className="space-y-2 group">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-cyan-600 transition-colors">
                  Nama Lengkap / Sekolah
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <Input 
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama Anda..."
                    className="pl-10 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 bg-white/50 text-slate-900 placeholder:text-slate-400 font-semibold"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-purple-600 transition-colors">
                  Nomor WhatsApp Aktif
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <Input 
                    value={noWa}
                    onChange={(e) => setNoWa(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="pl-10 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/50 text-slate-900 placeholder:text-slate-400 font-semibold"
                    disabled={loading}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Nomor ini akan digunakan sebagai jalur admin utama.
                </p>
              </div>

              <div className="space-y-2 group">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-indigo-600 transition-colors">
                  Tipe Aplikasi
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTipeBisnis("PENDIDIKAN")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${tipeBisnis === "PENDIDIKAN" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-300"}`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-semibold text-sm">Pendidikan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipeBisnis("BISNIS")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${tipeBisnis === "BISNIS" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-300"}`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-semibold text-sm">Perusahaan</span>
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold tracking-wide shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    MENYIAPKAN SISTEM...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AKTIFKAN TERMINAL
                  </div>
                )}
              </Button>
            </form>
          )}

          {!isGoogleSignedIn && (
            <>
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-slate-400 font-semibold backdrop-blur-xl">Atau</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = '/login'}
                  className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-800 font-semibold border-2 rounded-xl transition-all"
                >
                  Sudah punya akun? Login Disini
                </Button>
              </div>
            </>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-[11px] font-semibold text-slate-400">
              Powered by <a href="https://satujalan.id" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">satujalan.id</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
