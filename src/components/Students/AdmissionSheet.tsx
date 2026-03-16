'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { admissionSchema } from '@/lib/validators'
import BottomSheet from '../ui/BottomSheet'
import { CheckCircle2, User, MapPin, Calendar, CreditCard, LayoutGrid, Phone } from 'lucide-react'

export default function AdmissionSheet({
  isOpen,
  onClose,
  initialSeatId,
  initialSeatNumber,
}: {
  isOpen: boolean
  onClose: () => void
  initialSeatId?: string
  initialSeatNumber?: string
}) {
  const [step, setStep] = useState(1)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      admission_date: new Date().toISOString().split('T')[0],
      seat_id: initialSeatId || '',
      gender: 'male',
      selected_shifts: [],
      plan_months: 1,
      payment_status: 'paid',
    }
  })

  const onSubmit = (data: any) => {
    console.log('Final Admission Data:', data)
    // Here we would call Supabase to create student and record payment
    setStep(4) // Move to success
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={step < 4 ? "New Admission" : ""}>
      <div className="space-y-6">
        {/* Progress Bar */}
        {step < 4 && (
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-gray-100'}`} />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-500 mb-2">
                <User className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Personal Details</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Student Name*</label>
                  <input {...register('name')} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" placeholder="Full Name" />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message as string}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                  <input {...register('phone')} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gender*</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['male', 'female'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setValue('gender', g as any)}
                        className={`py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all ${
                          watch('gender') === g ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-50 bg-gray-50 text-gray-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-brand-900 text-white py-4 rounded-2xl font-bold text-sm mt-4 shadow-lg shadow-brand-900/20">
                Next: Seat & Shift →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-500 mb-2">
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Seat & Shift</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-brand-500 uppercase">Assigned Seat</p>
                    <p className="text-lg font-bold text-brand-900">{initialSeatNumber || 'Select from Map'}</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <LayoutGrid className="w-5 h-5 text-brand-500" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Shifts*</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['M', 'A', 'E', 'N'].map(code => {
                      const selected = watch('selected_shifts') as string[]
                      const isActive = selected.includes(code)
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            const next = isActive ? selected.filter(s => s !== code) : [...selected, code]
                            setValue('selected_shifts', next as any)
                          }}
                          className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                            isActive ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-50 bg-gray-50 text-gray-400'
                          }`}
                        >
                          {code === 'M' ? 'Morning' : code === 'A' ? 'Afternoon' : code === 'E' ? 'Evening' : 'Night'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-sm">Back</button>
                <button type="button" onClick={() => setStep(3)} className="flex-[2] bg-brand-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-900/20">
                  Next: Payment →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-500 mb-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Fees & Plan</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[1, 3, 6, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setValue('plan_months', m)}
                      className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                        watch('plan_months') === m ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-50 bg-gray-50 text-gray-400'
                      }`}
                    >
                      {m} Month{m > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
                
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Monthly Rate</span>
                    <span className="font-bold text-gray-900">₹900</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-brand-900">Total Admission Fee</span>
                    <span className="text-xl font-bold text-brand-500 font-mono">₹{900 * watch('plan_months')}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-sm">Back</button>
                <button type="submit" className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-green-100 active:scale-95 transition-transform">
                  Confirm Admission ✓
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
                ✓
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif text-brand-900">Admission Successful</h2>
                <p className="text-sm text-gray-500">Rahul Kumar has been assigned Seat {initialSeatNumber}.</p>
              </div>
              <div className="space-y-3">
                <button type="button" className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-100 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 fill-white" />
                  Send WhatsApp Receipt
                </button>
                <button type="button" onClick={onClose} className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-sm">
                  Close
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </BottomSheet>
  )
}
