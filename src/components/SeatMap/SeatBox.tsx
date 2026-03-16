'use client'

import { cn, SeatStatus } from '@/lib/utils'
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] })

interface SeatBoxProps {
  seatNumber: string
  status: SeatStatus
  shiftDisplay?: string   // "M+A", "MAEN", "E" — compact string
  daysLeft?: number | null
  hasLocker?: boolean
  onClick: () => void
  animationDelay?: number
}

const statusStyles: Record<SeatStatus, string> = {
  free:     'bg-white      border-gray-200  text-gray-600   hover:border-brand-500',
  occupied: 'bg-brand-100  border-brand-500 text-brand-800',
  expiring: 'bg-amber-100  border-amber-500 text-amber-800',
  expired:  'bg-red-100    border-red-500   text-red-800',
}

const shiftTextStyles: Record<SeatStatus, string> = {
  free:     'text-gray-400',
  occupied: 'text-brand-600',
  expiring: 'text-amber-700',
  expired:  'text-red-700',
}

export default function SeatBox({
  seatNumber,
  status,
  shiftDisplay,
  daysLeft,
  hasLocker,
  onClick,
  animationDelay = 0,
}: SeatBoxProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Size: 56px mobile, 64px desktop — fixed square
        'relative w-14 h-14 md:w-16 md:h-16',
        'rounded-xl border-2 flex flex-col items-start justify-between p-1.5',
        'transition-all duration-150 ease-out',
        'hover:scale-105 hover:shadow-md',
        'active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        statusStyles[status],
      )}
      style={{
        animation: `seatFadeIn 0.4s ease-out ${animationDelay}ms both`,
      }}
      aria-label={`Seat ${seatNumber} — ${status}`}
    >
      {/* Seat Number */}
      <span
        className={cn(
          'text-[14px] font-bold leading-none tracking-tight',
          jetbrainsMono.className,
        )}
      >
        {seatNumber}
      </span>

      {/* Bottom row: shift display OR "EXP" label */}
      <span
        className={cn(
          'text-[10px] font-semibold leading-none',
          shiftTextStyles[status],
        )}
      >
        {status === 'expired'
          ? <span className={cn('font-black text-[9px]', jetbrainsMono.className)}>EXP</span>
          : shiftDisplay ?? null}
      </span>

      {/* Locker dot — bottom-right, only when occupied/expiring */}
      {hasLocker && (status === 'occupied' || status === 'expiring') && (
        <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-sm" />
      )}

      {/* Pulse ring for expiring seats */}
      {status === 'expiring' && (
        <span className="absolute inset-0 rounded-xl border-2 border-amber-400 animate-ping opacity-20 pointer-events-none" />
      )}
    </button>
  )
}
