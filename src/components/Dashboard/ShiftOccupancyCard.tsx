'use client'

import { cn } from '@/lib/utils'
import { JetBrains_Mono } from 'next/font/google'

const mono = JetBrains_Mono({ subsets: ['latin'] })

interface ShiftStat {
  code: string
  name: string
  active: number
  male?: number
  female?: number
  total: number
}

export default function ShiftOccupancyCard({ shifts }: { shifts: ShiftStat[] }) {
  const shiftColors: Record<string, { bg: string; bar: string; text: string }> = {
    M: { bg: 'bg-amber-50', bar: 'bg-amber-400', text: 'text-amber-700' },
    A: { bg: 'bg-blue-50', bar: 'bg-blue-400', text: 'text-blue-700' },
    E: { bg: 'bg-purple-50', bar: 'bg-purple-400', text: 'text-purple-700' },
    N: { bg: 'bg-gray-100', bar: 'bg-gray-500', text: 'text-gray-700' },
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shift Occupancy</h3>
      <div className="space-y-2.5">
        {shifts.map((s) => {
          const colors = shiftColors[s.code] || shiftColors.M
          const pct = s.total > 0 ? Math.round((s.active / s.total) * 100) : 0

          return (
            <div key={s.code} className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm border shrink-0",
                colors.bg, colors.text,
                mono.className
              )}>
                {s.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.name}</span>
                    {(s.male !== undefined || s.female !== undefined) && (
                      <div className="flex items-center gap-1.5 opacity-60">
                         {s.male! > 0 && (
                          <span className="text-[9px] font-bold text-blue-600 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{s.male} M
                          </span>
                         )}
                         {s.female! > 0 && (
                          <span className="text-[9px] font-bold text-pink-600 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>{s.female} F
                          </span>
                         )}
                      </div>
                    )}
                  </div>
                  <span className={cn("text-xs font-black", mono.className, colors.text)}>
                    {s.active}/{s.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
