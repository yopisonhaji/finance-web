"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, signOut } from "@/lib/firebase";

export function ForceLogout() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        if (auth) await signOut(auth);
      } catch (e) {}
      localStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
    };
    doLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      <p>Sesi telah berakhir atau dihapus. Mengalihkan ke halaman login...</p>
    </div>
  );
}
