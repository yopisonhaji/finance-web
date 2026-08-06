"use client";

import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, signOut } from "@/lib/firebase";

export function HeaderProfile({ ownerName }: { ownerName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth!);
    } catch (e) {
      console.error("Firebase logout error", e);
    }
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-3 pl-3 border-l border-slate-800/60 relative cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="hidden md:block text-left leading-tight relative">
          <p className="text-sm font-semibold text-white capitalize flex items-center gap-1">
            {ownerName}
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-status-pulse"></span>
          </p>
          <p className="text-[10px] text-slate-400">Superadmin</p>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar (Log Out)
          </button>
        </div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}
