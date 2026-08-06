"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquareShare, FileBox, FileText, Settings, X, LogOut } from "lucide-react"
import { auth, signOut } from "@/lib/firebase"

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()

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
    { title: "Template Pesan WA", url: "/template", icon: FileBox, color: "text-orange-400" },
    { title: "Laporan Keuangan", url: "/laporan", icon: FileText, color: "text-rose-400" },
    { title: "Pengaturan", url: "/settings", icon: Settings, color: "text-slate-400" },
  ]

  const handleLogout = async () => {
    try {
      await signOut(auth!);
    } catch (e) {}
    localStorage.removeItem("token")
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/login")
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1e293b] rounded-t-3xl z-[70] animate-in slide-in-from-bottom-full duration-300 pb-[env(safe-area-inset-bottom)]">
        <div className="flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Menu Tambahan</h3>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
              return (
                <Link 
                  key={item.title} 
                  href={item.url}
                  onClick={onClose}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-[#0f172a] border border-transparent'}`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.title}
                  </span>
                </Link>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
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
    </>
  )
}
