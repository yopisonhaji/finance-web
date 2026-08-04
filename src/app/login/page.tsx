"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, ArrowRight } from "lucide-react";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      
      const result = await signInWithPopup(auth!, googleProvider);
      const email = result.user.email;
      const firebaseUid = result.user.uid;

      const res = await fetch("http://127.0.0.1:8080/api/login/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firebaseUid }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        router.push("/");
      } else {
        setError(data.error || "Login gagal, pastikan Anda menggunakan akun Google yang terdaftar.");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan saat menghubungi server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Wallet className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Finance AI Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
          Kelola pembayaran dengan kecerdasan buatan
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/20 dark:border-slate-800/50">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 flex items-start">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <p className="text-slate-500 font-medium text-sm text-center mb-6">
              Silakan login dengan akun Google yang Anda gunakan saat pendaftaran.
            </p>

            <Button 
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full h-14 bg-white hover:bg-slate-50 text-slate-700 font-bold tracking-wide shadow-md border border-slate-200 transition-all flex items-center justify-center gap-3 text-lg rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Login dengan Google
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Sistem diamankan dengan enkripsi end-to-end
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
