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




