'use client'

import { cn } from '@/lib/utils'

type FilterOption = 'All' | 'Paid' | 'Pending' | 'Expiring' | 'Expired'

export default function StudentFilters({
  activeFilter,
  onFilterChange,
  counts,
}: {
  activeFilter: string
  onFilterChange: (filter: FilterOption) => void
  counts: Record<string, number>
}) {
  const options: FilterOption[] = ['All', 'Paid', 'Pending', 'Expiring', 'Expired']

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onFilterChange(option)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
            activeFilter === option
              ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-100"
              : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
          )}
        >
          {option}
          {counts[option] > 0 && (
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px]",
              activeFilter === option
                ? "bg-white/20 text-white"
                : option === 'Expired' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            )}>
              {counts[option]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
