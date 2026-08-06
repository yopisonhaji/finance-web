"use client";

import React, { useState, useEffect } from "react";
import { saveSetupData } from "@/app/actions/setup";
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function SetupScreen() {
  const [nama, setNama] = useState("");
  const [noWa, setNoWa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firebaseUid, setFirebaseUid] = useState("");
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [tipeBisnis, setTipeBisnis] = useState("PENDIDIKAN");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      if (user) {
        setEmail(user.email || "");
        if (!nama) setNama(user.displayName || "");
        setFirebaseUid(user.uid);
        setIsGoogleSignedIn(true);
      }
    });

    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth!);
        if (result) {
          setEmail(result.user.email || "");
          if (!nama) setNama(result.user.displayName || "");
          setFirebaseUid(result.user.uid);
          setIsGoogleSignedIn(true);
        }
      } catch (err: any) {
        setError("Gagal memproses login Google: " + err.message);
      }
    };
    checkRedirect();
    
    return () => unsubscribe();
  }, [nama]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const popupPromise = signInWithPopup(auth!, googleProvider);
      const result = await popupPromise;
      
      setEmail(result.user.email || "");
      setNama(result.user.displayName || "");
      setFirebaseUid(result.user.uid);
      setIsGoogleSignedIn(true);
      setLoading(false);
    } catch (err: any) {
      if (err.code === "auth/popup-blocked") {
        setError("Popup diblokir, mengalihkan halaman...");
        await signInWithRedirect(auth!, googleProvider);
      } else {
        setError("Gagal daftar dengan Google: " + err.message);
        setLoading(false);
      }
    }
  };

  const handleEmailRegisterAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !noWa || !tipeBisnis) {
      setError("Harap lengkapi semua data wajib.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let currentUid = firebaseUid;
      let currentEmail = email;

      // Jika belum login via Google, maka daftarkan via Email/Password
      if (!isGoogleSignedIn) {
        if (!email || !password) {
          setError("Email dan Password wajib diisi.");
          setLoading(false);
          return;
        }
        
        try {
          const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
          currentUid = userCredential.user.uid;
          currentEmail = userCredential.user.email || email;
          setFirebaseUid(currentUid);
        } catch (authErr: any) {
          setError(authErr.message.includes("email-already-in-use") 
            ? "Email sudah digunakan. Silakan login." 
            : "Gagal membuat akun: " + authErr.message);
          setLoading(false);
          return;
        }
      }

      // Lanjutkan menyimpan data ke Turso database
      const res = await saveSetupData(nama, noWa, currentEmail, currentUid, tipeBisnis);
      
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
    } catch (err: any) {
      setError("Terjadi kesalahan sistem: " + err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500">
            Mengarahkan Anda ke Dashboard Finance AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
      <div className="w-full max-w-md p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Buat akun Gratis Anda</h1>
          <p className="text-gray-500 text-sm">
            Mulai kelola pembayaran otomatis dengan Finance AI.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-semibold border border-red-100 text-center mb-6">
            {error}
          </div>
        )}

        {!isGoogleSignedIn && (
          <>
            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors mb-6 disabled:opacity-50"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              <span className="font-medium">Daftar dengan Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-5 items-center mb-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Atau daftar dengan Email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
          </>
        )}

        {isGoogleSignedIn && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm mb-6 flex flex-col items-center border border-blue-100">
            <p className="font-medium">Akun Google terhubung:</p>
            <p className="font-bold">{email}</p>
            <p className="text-xs mt-1">Silakan lengkapi data profil di bawah ini.</p>
          </div>
        )}

        {/* Unified Registration Form */}
        <form onSubmit={handleEmailRegisterAndSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Lengkap / Institusi <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="Masukkan nama Anda"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isGoogleSignedIn && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="Contoh: 08123456789"
              value={noWa}
              onChange={(e) => setNoWa(e.target.value.replace(/\D/g, ""))}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipe Bisnis <span className="text-red-500">*</span>
            </label>
            <select
              value={tipeBisnis}
              onChange={(e) => setTipeBisnis(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="PENDIDIKAN">Institusi Pendidikan (Sekolah/Pesantren)</option>
              <option value="PERUSAHAAN">Perusahaan / Toko / Umum</option>
            </select>
          </div>

          {!isGoogleSignedIn && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Buat Kata Sandi <span className="text-red-500">*</span>
              </label>
              <input 
                type="password" 
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
                maxLength={20}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1"
              />
              <p className="text-xs text-gray-500">
                Silakan masukkan kata sandi minimal 8 karakter.
              </p>
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
