"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquareShare, FileText, Settings, X, LogOut, Wallet, Lock } from "lucide-react"
import { auth, signOut } from "@/lib/firebase"
import { useAppConfig } from "@/contexts/AppConfigContext"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  isGuest?: boolean
}

export function MobileDrawer({ isOpen, onClose, isGuest = false }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { paymentMode } = useAppConfig()
  
  const [showPremiumLock, setShowPremiumLock] = useState(false)
  const [lockedFeatureName, setLockedFeatureName] = useState("")

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const menuItems = [
    { title: "Terminal WhatsApp AI", url: "/wa", icon: MessageSquareShare, color: "text-teal-400" },
    { title: "Laporan Keuangan", url: "/laporan", icon: FileText, color: "text-rose-400" },
    ...(paymentMode === 'DEFAULT' ? [{ title: "Pencairan Dana", url: "/pencairan", icon: Wallet, color: "text-blue-400" }] : []),
    { title: "Pengaturan", url: "/settings", icon: Settings, color: "text-slate-700 dark:text-slate-300 font-medium" },
  ]

  const handleLogout = async () => {
    try {
      await signOut(auth!);
    } catch (e) {}
    localStorage.removeItem("token")
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/login")
  }

  const handleNavClick = (e: React.MouseEvent, title: string, url: string) => {
    if (isGuest && !["/", "/wa", "/settings"].includes(url)) {
      e.preventDefault();
      setLockedFeatureName(title);
      setShowPremiumLock(true);
    } else {
      onClose();
      router.push(url);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-50 dark:bg-[#1e293b] rounded-t-3xl z-[70] animate-in slide-in-from-bottom-full duration-300 pb-[env(safe-area-inset-bottom)]">
        <div className="flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Menu Tambahan</h3>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
              const isLocked = isGuest && !["/", "/wa", "/settings"].includes(item.url);
              return (
                <button 
                  key={item.title} 
                  onClick={(e) => handleNavClick(e, item.title, item.url)}
                  className={`flex items-center w-full text-left gap-4 p-4 rounded-xl transition-colors ${isActive ? 'bg-orange-500 dark:bg-blue-600/20 border border-orange-500 dark:border-blue-500/30' : 'bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-transparent'} ${isLocked ? 'opacity-70' : ''}`}
                >
                  <div className={`relative w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`flex-1 font-semibold ${isActive ? 'text-white dark:text-white' : 'text-slate-700 dark:text-slate-300'} ${isLocked ? 'line-through decoration-slate-400 text-slate-400' : ''}`}>
                    {item.title}
                  </span>
                  {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                </button>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-700">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 w-full rounded-xl transition-colors bg-red-500/10 text-red-500 border border-red-500/20"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-semibold">Keluar (Logout)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Premium Feature Lock Dialog */}
      <Dialog open={showPremiumLock} onOpenChange={setShowPremiumLock}>
        <DialogContent className="sm:max-w-md border-orange-500/20 dark:border-blue-500/20 z-[100]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-orange-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-900 dark:text-white">Fitur Terkunci (Premium)</DialogTitle>
            <DialogDescription className="text-center text-base mt-3 font-medium text-slate-800 dark:text-slate-200">
              Maaf, fitur <strong className="text-orange-600 dark:text-blue-400 font-bold text-lg">{lockedFeatureName}</strong> hanya tersedia untuk akun resmi (Premium).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center text-[15px] leading-relaxed font-medium text-slate-700 dark:text-slate-300">
            Daftar sekarang secara <span className="font-bold text-emerald-600 dark:text-emerald-400">gratis</span> untuk membuka seluruh fitur aplikasi dan rasakan kemudahannya!
          </div>
          <DialogFooter className="sm:justify-center flex-col space-y-2 w-full sm:flex-col sm:space-x-0">
            <Button type="button" className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold h-11" onClick={() => window.location.href = '/register'}>
              Buka Kunci (Daftar Sekarang)
            </Button>
            <Button type="button" variant="ghost" className="w-full h-11" onClick={() => setShowPremiumLock(false)}>
              Nanti Saja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}




