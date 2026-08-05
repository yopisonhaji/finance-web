"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Menu, Wallet } from "lucide-react"
import { useState } from "react"
import { MobileDrawer } from "./MobileDrawer"

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
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

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e293b] border-t border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between h-16 relative px-2">
          
          {/* Nav Items Left */}
          <div className="flex w-2/5 justify-around">
            <Link href={navItems[0].url} className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1">
              <LayoutDashboard className={`w-6 h-6 ${pathname === navItems[0].url ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-medium ${pathname === navItems[0].url ? 'text-blue-500' : 'text-slate-400'}`}>Beranda</span>
            </Link>
            <Link href={navItems[1].url} className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1">
              <Users className={`w-6 h-6 ${pathname === navItems[1].url || pathname.startsWith(navItems[1].url + '/') ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-medium ${pathname === navItems[1].url || pathname.startsWith(navItems[1].url + '/') ? 'text-blue-500' : 'text-slate-400'}`}>Siswa</span>
            </Link>
          </div>

          {/* Floating Action Button (Center) */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[40%] flex flex-col items-center z-50">
            <Link href="/kasir" className="w-14 h-14 rounded-full bg-blue-600 border-[6px] border-[#0f172a] shadow-lg flex items-center justify-center text-white hover:bg-blue-500 active:scale-95 transition-transform">
              <Wallet className="w-6 h-6" />
            </Link>
            <span className="text-[10px] font-medium text-slate-400 mt-1">Kasir</span>
          </div>

          {/* Nav Items Right */}
          <div className="flex w-2/5 justify-around">
            <Link href={navItems[2].url} className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1">
              <FileText className={`w-6 h-6 ${pathname === navItems[2].url || pathname.startsWith(navItems[2].url + '/') ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-medium ${pathname === navItems[2].url || pathname.startsWith(navItems[2].url + '/') ? 'text-blue-500' : 'text-slate-400'}`}>Tagihan</span>
            </Link>
            <button onClick={() => setIsDrawerOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1 bg-transparent border-none">
              <Menu className={`w-6 h-6 ${isDrawerOpen ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-medium ${isDrawerOpen ? 'text-blue-500' : 'text-slate-400'}`}>Menu</span>
            </button>
          </div>

        </div>
      </div>
      
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  )
}
