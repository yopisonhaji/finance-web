"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function UpdateButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { t } = useLanguage();
  
  // Check for updates on mount
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await fetch('/api/update');
        const data = await res.json();
        if (data.hasUpdate) {
          setHasUpdate(true);
        }
      } catch (err) {
        console.error("Failed to check update", err);
      } finally {
        setIsChecking(false);
      }
    };
    
    // Cek saat pertama kali dibuka
    checkUpdate();

    // Cek otomatis setiap 15 menit (900.000 ms)
    const interval = setInterval(() => {
      if (!isUpdating) checkUpdate();
    }, 900000);

    return () => clearInterval(interval);
  }, [isUpdating]);

  const handleUpdate = async () => {
    if (isUpdating || !hasUpdate) return;
    setIsUpdating(true);
    setErrorMsg("");
    
    try {
      const res = await fetch('/api/update', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setHasUpdate(false);
        setShowSuccess(true);
        // Do not hide success immediately because app will restart
      } else {
        throw new Error(data.error || t("update.failed"));
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsUpdating(false);
    }
  };

  return (
    <button 
      onClick={handleUpdate}
      disabled={isUpdating || isChecking || (!hasUpdate && !showSuccess)}
      className="relative group focus:outline-none"
    >
      {/* Glow Effect saat ada update yang lebih ringan */}
      {hasUpdate && !isUpdating && (
        <div className="absolute -inset-1 bg-amber-500/20 rounded-full animate-status-pulse group-hover:bg-amber-500/30 transition-all duration-300 pointer-events-none"></div>
      )}
      
      <div className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
        isUpdating 
          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
          : showSuccess
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : errorMsg
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : hasUpdate 
                ? 'bg-slate-800/80 border-amber-500/40 text-amber-400 hover:bg-amber-500/10' 
                : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-700/50'
      }`}>
        {showSuccess ? (
          <CheckCircle2 size={16} />
        ) : errorMsg ? (
          <AlertCircle size={16} />
        ) : (
          <RefreshCw size={16} className={isUpdating || isChecking ? 'animate-spin' : ''} />
        )}
        <span className="text-xs font-bold tracking-wide">
          {isChecking ? t("update.checking") : isUpdating ? t("update.downloading") : showSuccess ? t("update.restarting") : errorMsg ? t("update.failed") : hasUpdate ? t("update.available") : t("update.latest")}
        </span>
      </div>
    </button>
  );
}
