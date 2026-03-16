'use client'

import { cn } from '@/lib/utils'

type Status = 'active' | 'expired' | 'pending' | 'inactive' | 'expiring' | 'occupied' | 'free'

const statusConfig: Record<Status, { bg: string, text: string, dot: string, label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Active' },
  occupied: { bg: 'bg-brand-100', text: 'text-brand-700', dot: 'bg-brand-500', label: 'Occupied' },
  expired: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Expired' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Inactive' },
  expiring: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-600', label: 'Expiring' },
  free: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-300', label: 'Free' },
}

export default function StatusBadge({ status, className }: { status: Status, className?: string }) {
  const config = statusConfig[status]
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      config.bg,
      config.text,
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  )
}
