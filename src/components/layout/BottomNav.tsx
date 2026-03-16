'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, Users, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Seat_Map', icon: Grid, href: '/seat-map' },
    { label: 'Students', icon: Users, href: '/students' },
    { label: 'Alerts', icon: Bell, href: '/notifications' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex items-center justify-around pb-safe-bottom">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-2 px-4 transition-colors",
              isActive ? "text-brand-500" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive && "fill-brand-500/10")} />
            <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">{item.label}</span>
            {isActive && <div className="absolute bottom-0 w-8 h-1 bg-brand-500 rounded-t-full" />}
          </Link>
        )
      })}
    </nav>
  )
}
