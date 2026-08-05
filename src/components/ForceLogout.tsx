"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ForceLogout() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <p>Sesi telah berakhir atau dihapus. Mengalihkan ke halaman login...</p>
    </div>
  );
}
