"use client";

import React, { useState, useEffect } from "react";
import { saveSetupData } from "@/app/actions/setup";
import { auth, googleProvider, facebookProvider, signInWithPopup, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "@/lib/firebase";
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

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const popupPromise = signInWithPopup(auth!, facebookProvider);
      const result = await popupPromise;
      
      setEmail(result.user.email || "");
      setNama(result.user.displayName || "");
      setFirebaseUid(result.user.uid);
      setIsGoogleSignedIn(true);
      setLoading(false);
    } catch (err: any) {
      if (err.code === "auth/popup-blocked") {
        setError("Popup diblokir, mengalihkan halaman...");
        await signInWithRedirect(auth!, facebookProvider);
      } else {
        setError("Gagal daftar dengan Facebook: " + err.message);
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
          if (authErr.message.includes("email-already-in-use")) {
            try {
              const userCredential = await signInWithEmailAndPassword(auth!, email, password);
              currentUid = userCredential.user.uid;
              currentEmail = userCredential.user.email || email;
              setFirebaseUid(currentUid);
            } catch (signInErr: any) {
              setError("Email sudah terdaftar di sistem. Jika ini milik Anda, password yang dimasukkan salah. Silakan login.");
              setLoading(false);
              return;
            }
          } else {
            setError("Gagal membuat akun: " + authErr.message);
            setLoading(false);
            return;
          }
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
    <div className="flex min-h-screen bg-white text-gray-800">
      
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 z-10 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex lg:hidden justify-center mb-6">
            <img src="/app-logo.png" alt="Logo" className="w-16 h-16 rounded-xl shadow-sm object-cover" />
          </div>
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
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                <span className="font-medium text-sm">Google</span>
              </button>

              <button 
                onClick={handleFacebookLogin}
                disabled={loading}
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <img src="/facebook-icon.svg" alt="Facebook" className="w-5 h-5" />
                <span className="font-medium text-sm">Facebook</span>
              </button>
            </div>

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
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold rounded-md py-2 mt-6 hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Pendaftaran"
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p className="mb-4 text-xs">
            Dengan melanjutkan, Anda setuju dengan Syarat layanan dan Kebijakan privasi aplikasi kami.
          </p>
          <p className="mb-4">
            Sudah memiliki akun? <a href="/login" className="text-blue-600 font-semibold hover:underline">Masuk</a>
          </p>
          <p className="text-[11px] font-semibold tracking-wider uppercase mt-8 text-gray-400">
            Powered by <span className="text-blue-500">satujalan.id</span>
          </p>
        </div>
        
        </div>
      </div>

      {/* Right Side: Giant Logo Showcase (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Giant Logo */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <img 
            src="/app-logo.png" 
            alt="Finance AI Giant Logo" 
            className="w-3/4 max-w-2xl object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] opacity-90 mb-8"
          />
          <p className="text-slate-400 font-medium tracking-[0.2em] uppercase text-sm">
            Powered by <span className="text-blue-400 font-bold">satujalan.id</span>
          </p>
        </div>
        
        {/* Optional decorative overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/80 z-0 pointer-events-none"></div>
      </div>
    </div>
  );
}
