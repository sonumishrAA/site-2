'use client'

import { cn, SeatStatus } from '@/lib/utils'
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] })

interface SeatBoxProps {
  seatNumber: string
  status: SeatStatus
  shiftOccupancy?: { shift: string; status: 'occupied' | 'expiring' | 'expired' | 'vacant'; studentName: string | null }[]
  hasLocker?: boolean
  onClick: () => void
  animationDelay?: number
}

export default function SeatBox({
  seatNumber,
  status,
  shiftOccupancy,
  hasLocker,
  onClick,
  animationDelay = 0
}: SeatBoxProps) {
  
  const statusStyles = {
    free: "bg-white border-gray-200 text-gray-600 hover:border-brand-500 hover:shadow-md",
    occupied: "bg-brand-100 border-brand-500 text-brand-800",
    expiring: "bg-amber-100 border-amber-500 text-amber-800",
    expired: "bg-red-100 border-red-500 text-red-800"
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full rounded-xl border-2 flex flex-col p-2 transition-all duration-200 active:scale-95 group hover:scale-[1.02] hover:shadow-lg min-h-[100px]",
        statusStyles[status],
        status === 'expiring' && "animate-subtle-pulse"
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
        animation: `fadeInUp 0.4s ease-out ${animationDelay}ms both`
      }}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <span className={cn(
          "text-sm font-bold tracking-tight",
          jetbrainsMono.className
        )}>
          {seatNumber}
        </span>
        {hasLocker && status !== 'free' && (
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-sm" />
        )}
      </div>
      
      {shiftOccupancy && shiftOccupancy.length > 0 && (
        <div className="flex flex-col gap-[2px] w-full text-left mt-auto">
          {shiftOccupancy.map(s => (
            <div key={s.shift} className="flex justify-between items-center text-[9px] w-full leading-tight">
              <span className={cn(
                "font-black opacity-70 w-3",
                s.status === 'vacant' ? '' : s.status === 'expired' ? 'text-red-700' : 'text-brand-700'
              )}>{s.shift}</span>
              <span className={cn(
                "truncate flex-1 text-right ml-1 font-medium",
                s.status === 'vacant' ? 'opacity-40 italic font-mono text-[8px]' : s.status === 'expired' ? 'text-red-800 font-bold' : ''
              )}>
                {s.status === 'vacant' ? 'Free' : (s.studentName?.split(' ')[0] || '')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pulse ring for expiring */}
      {status === 'expiring' && (
        <div className="absolute inset-0 rounded-xl border-2 border-amber-400 animate-ping opacity-20 pointer-events-none" />
      )}
    </button>
  )
}
