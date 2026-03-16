'use client'

import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { CreditCard, Wallet, Smartphone, Banknote, User } from 'lucide-react'

export default function FeeCollectionSheet({
  isOpen,
  onClose,
  student,
}: {
  isOpen: boolean
  onClose: () => void
  student: any
}) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'cash' | 'upi' | 'online'>('cash')
  const [type, setType] = useState<'admission' | 'renewal' | 'locker_deposit'>('renewal')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleCollect = () => {
    // Record payment logic
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className="py-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl">
            ₹
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-brand-900">Fee Collected</h2>
            <p className="text-sm text-gray-500">₹{amount} recorded for {student?.name}</p>
          </div>
          <button onClick={onClose} className="w-full bg-brand-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-900/20">
            Done
          </button>
        </div>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Collect Fee">
      <div className="space-y-8">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-brand-500 shadow-sm">
            {student?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Collecting from</p>
            <p className="font-bold text-gray-900 leading-none">{student?.name}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Amount (₹)*</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-8 pr-4 py-4 text-xl font-mono font-bold focus:border-brand-500 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Payment Method*</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'upi', label: 'UPI', icon: Smartphone },
                { id: 'online', label: 'Online', icon: Wallet },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as any)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    method === m.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-50 bg-gray-50 text-gray-400'
                  }`}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Payment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['Admission', 'Renewal', 'Locker'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t.toLowerCase() as any)}
                  className={`py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all ${
                    type === t.toLowerCase() ? 'bg-brand-900 text-white border-brand-900' : 'bg-white text-gray-400 border-gray-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleCollect}
          disabled={!amount}
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-green-100 active:scale-95 transition-transform disabled:opacity-50"
        >
          Confirm Payment Receipt
        </button>
      </div>
    </BottomSheet>
  )
}
