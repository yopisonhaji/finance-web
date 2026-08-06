"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, facebookProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth!);
        if (result) {
          setLoading(true);
          const email = result.user.email;
          const firebaseUid = result.user.uid;
          
          const { verifyLogin } = await import("@/app/actions/auth");
          const data = await verifyLogin(email || "", firebaseUid);

          if (data.success) {
            localStorage.setItem("token", data.token!);
            document.cookie = `token=${data.token}; path=/; max-age=864000`;
            router.push("/");
          } else {
            setError("Akun belum terdaftar. Mengalihkan ke pendaftaran...");
            setTimeout(() => {
              router.push("/register");
            }, 1500);
          }
        }
      } catch (err: any) {
        setError("Gagal memproses login: " + err.message);
        setLoading(false);
      }
    };
    checkRedirect();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      const popupPromise = signInWithPopup(auth!, googleProvider);
      
      setLoading(true);
      setError("");
      
      const result = await popupPromise;
      const email = result.user.email;
      const firebaseUid = result.user.uid;

      const { verifyLogin } = await import("@/app/actions/auth");
      const data = await verifyLogin(email || "", firebaseUid);

      if (data.success) {
        localStorage.setItem("token", data.token!);
        document.cookie = `token=${data.token}; path=/; max-age=864000`;
        router.push("/");
      } else {
        setError("Akun belum terdaftar. Mengalihkan ke pendaftaran...");
        setTimeout(() => {
          router.push("/register");
        }, 1500);
      }
    } catch (err: any) {
      if (err.code === "auth/popup-blocked") {
        setError("Popup diblokir browser, mengalihkan ke halaman login...");
        try {
          await signInWithRedirect(auth!, googleProvider);
        } catch (redirectErr: any) {
          setError("Gagal mengalihkan halaman: " + redirectErr.message);
          setLoading(false);
        }
      } else {
        setError("Gagal masuk dengan Google.");
        setLoading(false);
      }
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const popupPromise = signInWithPopup(auth!, facebookProvider);
      
      setLoading(true);
      setError("");
      
      const result = await popupPromise;
      const email = result.user.email;
      const firebaseUid = result.user.uid;

      const { verifyLogin } = await import("@/app/actions/auth");
      const data = await verifyLogin(email || "", firebaseUid);

      if (data.success) {
        localStorage.setItem("token", data.token!);
        document.cookie = `token=${data.token}; path=/; max-age=864000`;
        router.push("/");
      } else {
        setError("Akun belum terdaftar. Mengalihkan ke pendaftaran...");
        setTimeout(() => {
          router.push("/register");
        }, 1500);
      }
    } catch (err: any) {
      if (err.code === "auth/popup-blocked") {
        setError("Popup diblokir browser, mengalihkan ke halaman login...");
        try {
          await signInWithRedirect(auth!, facebookProvider);
        } catch (redirectErr: any) {
          setError("Gagal mengalihkan halaman: " + redirectErr.message);
          setLoading(false);
        }
      } else {
        setError("Gagal masuk dengan Facebook: " + err.message);
        setLoading(false);
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth!, email, password);
      const userEmail = userCredential.user.email;
      const firebaseUid = userCredential.user.uid;

      const { verifyLogin } = await import("@/app/actions/auth");
      const data = await verifyLogin(userEmail || "", firebaseUid);

      if (data.success) {
        localStorage.setItem("token", data.token!);
        document.cookie = `token=${data.token}; path=/; max-age=864000`;
        router.push("/");
      } else {
        setError("Akun belum terdaftar. Mengalihkan ke pendaftaran...");
        setTimeout(() => {
          router.push("/register");
        }, 1500);
      }
    } catch (err: any) {
      setError("Email atau kata sandi salah.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
      <div className="w-full max-w-md p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/app-logo.png" alt="Logo" className="w-20 h-20 rounded-2xl shadow-sm object-cover" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Masuk ke Finance AI</h1>
          <p className="text-gray-500 text-sm">
            Selamat datang kembali! Silakan masuk ke akun Anda.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-semibold border border-red-100 text-center mb-4">
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            )}
            <span className="font-medium text-sm">Google</span>
          </button>

          <button 
            onClick={handleFacebookLogin}
            disabled={loading}
            type="button"
            className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <img src="/facebook-icon.svg" alt="Facebook" className="w-5 h-5" />
            )}
            <span className="font-medium text-sm">Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-5 items-center mb-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium mb-1">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <input 
              type="password" 
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold rounded-md py-2 mt-4 hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Masuk"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Belum memiliki akun? <a href="/register" className="text-blue-600 font-semibold hover:underline">Daftar Gratis</a>
          </p>
        </div>

      </div>
    </div>
  );
}
