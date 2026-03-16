'use client'

import { useState, useEffect } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { calcRenewalEndDate } from '@/lib/utils'
import { format } from 'date-fns'

export default function RenewalSheet({
  isOpen,
  onClose,
  student,
}: {
  isOpen: boolean
  onClose: () => void
  student: any
}) {
  const [months, setMonths] = useState(1)
  const [newEndDate, setNewEndDate] = useState<Date | null>(null)

  useEffect(() => {
    if (student) {
      setNewEndDate(calcRenewalEndDate(student.end_date, months))
    }
  }, [student, months])

  if (!student) return null

  const isAlreadyExpired = new Date(student.end_date) < new Date()

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Renew Subscription">
      <div className="space-y-8">
        {/* Date Calculation Logic (GAP 5 FIX) */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {isAlreadyExpired ? 'New plan starts from today' : 'Plan extends from current end date'}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Current End</p>
                <p className="text-sm font-bold text-gray-700">{student.end_date}</p>
              </div>
              <div className="flex-1 h-[2px] bg-gray-200 mx-4 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] font-bold text-brand-500">
                  +{months}M
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-brand-500 uppercase">New End</p>
                <p className="text-sm font-bold text-brand-700">
                  {newEndDate ? format(newEndDate, 'dd MMM yyyy') : '...'}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-500 italic">
              {isAlreadyExpired 
                ? "Expired days are not backdated." 
                : `${Math.ceil((new Date(student.end_date).getTime() - Date.now()) / 86400000)} remaining days are preserved.`}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Select Plan Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 6, 12].map(m => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    months === m 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-sm font-medium text-gray-500">Renewal Fee</span>
            <span className="text-xl font-bold text-gray-900 font-mono">₹{900 * months}</span>
          </div>
          
          <button className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-100 active:scale-95 transition-transform">
            Confirm Renewal & Pay
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
