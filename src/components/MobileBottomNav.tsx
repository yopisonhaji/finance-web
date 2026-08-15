"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, FileText, Menu, Wallet, Lock } from "lucide-react"
import { useState } from "react"
import { MobileDrawer } from "./MobileDrawer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function MobileBottomNav({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showPremiumLock, setShowPremiumLock] = useState(false)
  const [lockedFeatureName, setLockedFeatureName] = useState("")
  
  const navItems = [
    {
      title: "Beranda",
      icon: LayoutDashboard,
      url: "/",
    },
    {
      title: "Siswa",
      icon: Users,
      url: "/santri",
    },
    // The middle space is reserved for FAB
    {
      title: "Tagihan",
      icon: FileText,
      url: "/tunggakan",
    }
  ]

  const handleNavClick = (e: React.MouseEvent, title: string, url: string) => {
    if (isGuest && !["/", "/wa", "/settings"].includes(url)) {
      e.preventDefault();
      setLockedFeatureName(title);
      setShowPremiumLock(true);
    } else {
      router.push(url);
    }
  }

  return (
    <>
      <div data-bottom-nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1e293b] border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_20px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)] overflow-visible">
        <div className="flex items-center justify-between h-16 relative px-2 overflow-visible">
          
          {/* Nav Items Left */}
          <div className="flex w-2/5 justify-around">
            <button onClick={(e) => handleNavClick(e, navItems[0].title, navItems[0].url)} className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1 bg-transparent border-none">
              <LayoutDashboard className={`w-6 h-6 ${pathname === navItems[0].url ? 'text-orange-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 font-medium'}`} />
              <span className={`text-[10px] font-medium ${pathname === navItems[0].url ? 'text-orange-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>Beranda</span>
            </button>
            <button onClick={(e) => handleNavClick(e, navItems[1].title, navItems[1].url)} className="relative flex flex-col items-center justify-center w-full h-full gap-1 pt-1 bg-transparent border-none">
              {isGuest && <div className="absolute top-1 right-2 w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center"><Lock className="w-2 h-2 text-slate-500" /></div>}
              <Users className={`w-6 h-6 ${pathname === navItems[1].url || pathname.startsWith(navItems[1].url + '/') ? 'text-orange-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 font-medium'} ${isGuest ? 'opacity-50' : ''}`} />
              <span className={`text-[10px] font-medium ${pathname === navItems[1].url || pathname.startsWith(navItems[1].url + '/') ? 'text-orange-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 font-medium'} ${isGuest ? 'opacity-50 line-through decoration-slate-400' : ''}`}>Siswa</span>
            </button>
          </div>

          {/* Floating Action Button (Center) - Kasir */}
          <div className="absolute left-1/2 -top-7 -translate-x-1/2 flex flex-col items-center z-50" style={{ width: 56 }}>
            <button onClick={(e) => handleNavClick(e, "Kasir", "/kasir")} className="w-14 h-14 rounded-full bg-orange-600 dark:bg-blue-600 border-[5px] border-white dark:border-[#0f172a] shadow-lg shadow-orange-500/25 dark:shadow-blue-500/25 flex items-center justify-center text-white hover:bg-orange-500 dark:hover:bg-blue-500 active:scale-95 transition-transform relative">
              {isGuest && <div className="absolute top-1 right-1 w-4 h-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm"><Lock className="w-2.5 h-2.5 text-orange-600 dark:text-blue-400" /></div>}
              <Wallet className={`w-6 h-6 shrink-0 ${isGuest ? 'opacity-70' : ''}`} />
            </button>
            <span className={`text-[10px] font-medium text-slate-700 dark:text-slate-300 mt-1.5 whitespace-nowrap ${isGuest ? 'line-through decoration-slate-400 opacity-70' : ''}`}>Kasir</span>
          </div>

          {/* Nav Items Right */}
          <div className="flex w-2/5 justify-around">
            <button onClick={(e) => handleNavClick(e, navItems[2].title, navItems[2].url)} className="relative flex flex-col items-center justify-center w-full h-full gap-1 pt-1 bg-transparent border-none">
              {isGuest && <div className="absolute top-1 right-2 w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center"><Lock className="w-2 h-2 text-slate-500" /></div>}
              <FileText className={`w-6 h-6 ${pathname === navItems[2].url || pathname.startsWith(navItems[2].url + '/') ? 'text-orange-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 font-medium'} ${isGuest ? 'opacity-50' : ''}`} />
              <span className={`text-[10px] font-medium ${pathname === navItems[2].url || pathname.startsWith(navItems[2].url + '/') ? 'text-orange-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 font-medium'} ${isGuest ? 'opacity-50 line-through decoration-slate-400' : ''}`}>Tagihan</span>
            </button>
            <button onClick={() => setIsDrawerOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1 bg-transparent border-none">
              <Menu className={`w-6 h-6 ${isDrawerOpen ? 'text-orange-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 font-medium'}`} />
              <span className={`text-[10px] font-medium ${isDrawerOpen ? 'text-orange-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>Menu</span>
            </button>
          </div>

        </div>
      </div>
      
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} isGuest={isGuest} />

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




