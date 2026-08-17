"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquareShare, FileText, Settings, X, LogOut, Wallet, Lock, Bot } from "lucide-react"
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
    { title: "Pengaturan AI", url: "/ai-settings", icon: Bot, color: "text-purple-500" },
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden z-[100]">
          <div className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-8 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(234,88,12,0.15)] dark:shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-orange-100 dark:border-blue-900/50">
              <Lock className="w-8 h-8 text-orange-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-center text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
              Fitur Terkunci
            </DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed font-medium text-slate-600 dark:text-slate-300">
              Maaf, menu <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold mx-1 border border-slate-200 dark:border-slate-700 shadow-sm">{lockedFeatureName}</span> merupakan fitur premium.
            </DialogDescription>
          </div>
          
          <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <p className="text-[14px] leading-relaxed font-medium text-slate-700 dark:text-slate-300 mb-5">
              Daftar sekarang secara <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md mx-1">GRATIS</span> untuk membuka seluruh fitur & keajaiban AI kami!
            </p>
            <div className="flex flex-col space-y-3 w-full">
              <Button type="button" className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 dark:from-blue-600 dark:to-blue-500 dark:hover:from-blue-700 dark:hover:to-blue-600 text-white font-bold h-12 text-[15px] shadow-lg shadow-orange-600/20 dark:shadow-blue-600/20 rounded-xl transition-all hover:scale-[1.02]" onClick={() => window.location.href = '/register'}>
                Buka Kunci Sekarang
              </Button>
              <Button type="button" variant="ghost" className="w-full h-11 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium rounded-xl" onClick={() => setShowPremiumLock(false)}>
                Nanti Saja, Lanjut Uji Coba
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}




