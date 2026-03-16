'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionBanner({ daysLeft }: { daysLeft: number }) {
  if (daysLeft > 7) return null

  const isExpired = daysLeft <= 0

  return (
    <div className={`px-4 py-2 flex items-center justify-between text-xs font-medium ${
      isExpired ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-800'
    }`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>
          {isExpired 
            ? 'Your subscription has expired. Renew to keep using the app.'
            : `Subscription expires in ${daysLeft} days. Renew now to avoid data deletion.`
          }
        </span>
      </div>
      <Link 
        href="/renew" 
        className={`px-3 py-1 rounded-full whitespace-nowrap ${
          isExpired ? 'bg-white text-red-600 font-bold' : 'bg-amber-500 text-white font-bold'
        }`}
      >
        Renew Now
      </Link>
    </div>
  )
}
