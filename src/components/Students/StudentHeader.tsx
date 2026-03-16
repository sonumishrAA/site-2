'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Upload, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import NewAdmissionSheet from './NewAdmissionSheet'

interface Filter {
  label: string
  value: string
  count: number
  color: string
}

export default function StudentHeader({ 
  currentFilter, 
  filters 
}: { 
  currentFilter: string
  filters: Filter[] 
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-14 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-brand-900 leading-none">Students</h2>
          <div className="flex gap-2">
            <Link 
              href="/students/import"
              className="bg-white border border-gray-200 text-gray-600 p-2.5 rounded-xl active:scale-95 transition-transform"
            >
              <Upload className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => setIsSheetOpen(true)}
              className="bg-brand-500 text-white p-2.5 rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or seat..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((f) => (
            <Link 
              key={f.value}
              href={`/students?filter=${f.value}`}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-2 transition-all",
                currentFilter === f.value 
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/10" 
                  : "bg-white border border-gray-200 text-gray-500"
              )}
            >
              {f.label}
              <span className={cn(
                "px-1.5 py-0.5 rounded-md text-[8px]",
                currentFilter === f.value ? "bg-white/20 text-white" : f.color
              )}>
                {f.count || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <NewAdmissionSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
      />
    </>
  )
}
