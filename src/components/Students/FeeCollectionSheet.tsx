'use client'

import { useState, useMemo } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { Banknote, Smartphone, Wallet, X, Loader2, CheckCircle2, TicketPercent, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateStudent } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function FeeCollectionSheet({
  isOpen,
  onClose,
  student,
}: {
  isOpen: boolean
  onClose: () => void
  student: any
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [collectionType, setCollectionType] = useState<'full' | 'discount'>('full')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [method, setMethod] = useState<'cash' | 'upi' | 'online'>('cash')
  const [isSuccess, setIsSuccess] = useState(false)

  const balanceDue = useMemo(() => {
    if (!student) return 0
    return (student.total_fee || 0) - (student.amount_paid || 0)
  }, [student])

  const netAmountToPay = useMemo(() => {
    if (collectionType === 'full') return balanceDue
    return Math.max(0, balanceDue - discountAmount)
  }, [balanceDue, collectionType, discountAmount])

  const handleCollect = async () => {
    if (!student) return
    setLoading(true)
    try {
      // Calculate new total amount paid
      const newAmountPaid = (student.amount_paid || 0) + netAmountToPay
      
      // If full payment or discounted full payment, set status to 'paid' or 'discounted'
      const newStatus = collectionType === 'full' ? 'paid' : 'discounted'
      const newDiscountTotal = (student.discount_amount || 0) + (collectionType === 'discount' ? discountAmount : 0)

      const res = await updateStudent(student.id, {
        ...student,
        // Map student object fields to what updateStudent expects
        shifts: student.selected_shifts || student.shift_display?.split('+') || [],
        seat_id: student.seat_id || student.seats?.id,
        locker_id: student.locker_id,
        has_locker: !!student.locker_id,
        payment_status: newStatus,
        amount_paid: newAmountPaid,
        discount_amount: newDiscountTotal,
        // Ensure name, phone etc are kept
        name: student.name,
        phone: student.phone,
        father_name: student.father_name,
        address: student.address,
        gender: student.gender,
        end_date: student.end_date
      })

      if (res.success) {
        setIsSuccess(true)
        router.refresh()
      } else {
        alert(res.error || 'Failed to update payment')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className="py-10 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-brand-900">Payment Recorded</h2>
            <p className="text-sm text-gray-500 font-medium">₹{netAmountToPay} successfully collected from {student?.name}</p>
          </div>
          <button onClick={onClose} className="w-full bg-brand-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-900/20 active:scale-95 transition-transform">
            Continue
          </button>
        </div>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Collect Pending Balance">
      <div className="space-y-6">
        {/* Student Info Card */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-brand-500 shadow-sm border border-brand-50">
              {student?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Collecting From</p>
              <p className="font-bold text-gray-900 leading-none">{student?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">Balance Due</p>
            <p className="text-lg font-black text-gray-900 font-mono leading-none">₹{balanceDue}</p>
          </div>
        </div>

        {/* Collection Type Options */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Collection Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCollectionType('full')}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                collectionType === 'full' ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm" : "border-gray-100 bg-white text-gray-400"
              )}
            >
              <Coins className={cn("w-6 h-6", collectionType === 'full' ? "text-brand-500" : "text-gray-300")} />
              <span className="text-xs font-bold uppercase tracking-wider">Fully Collected</span>
            </button>
            <button
              onClick={() => setCollectionType('discount')}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                collectionType === 'discount' ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm" : "border-gray-100 bg-white text-gray-400"
              )}
            >
              <TicketPercent className={cn("w-6 h-6", collectionType === 'discount' ? "text-purple-500" : "text-gray-300")} />
              <span className="text-xs font-bold uppercase tracking-wider">With Discount</span>
            </button>
          </div>
        </div>

        {/* Conditional Inputs */}
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          {collectionType === 'discount' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-purple-600">Apply Extra Discount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">₹</span>
                <input
                  type="number"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Math.min(balanceDue, parseFloat(e.target.value) || 0))}
                  className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl pl-8 pr-4 py-4 text-xl font-mono font-bold text-purple-900 focus:border-purple-500 outline-none"
                  placeholder="0"
                />
              </div>
              <p className="text-[9px] text-purple-500 font-medium ml-1">Remaining balance of ₹{balanceDue} will be adjusted.</p>
            </div>
          )}

          <div className="bg-gray-900 rounded-2xl p-5 text-white flex justify-between items-center shadow-lg shadow-gray-900/20">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Final Payment Received</p>
              <p className="text-2xl font-black font-mono">₹{netAmountToPay}</p>
            </div>
            <div className="bg-white/10 p-2 rounded-xl border border-white/10">
              <Banknote className="w-6 h-6 text-brand-400" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'upi', label: 'UPI', icon: Smartphone },
                { id: 'online', label: 'Online', icon: Wallet },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    method === m.id ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-white border-gray-100 text-gray-400"
                  )}
                >
                  <m.icon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleCollect}
          disabled={loading || netAmountToPay <= 0 && collectionType === 'full'}
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-green-100 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          Confirm Collection & Mark Paid
        </button>
      </div>
    </BottomSheet>
  )
}
