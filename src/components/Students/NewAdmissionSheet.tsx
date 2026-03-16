'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Loader2, User, Grid, CreditCard, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/client'
import PhoneInput from '@/components/ui/PhoneInput'
import { cn, formatPhone, sortSeats } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { submitNewAdmission } from '@/app/actions'

interface Seat {
  id: string
  seat_number: string
  gender: string
  student_seat_shifts?: { seat_id: string; shift_code: string; student_id: string }[]
}

interface ActiveShift {
  seat_id: string
  shift_code: string
}

interface Locker {
  id: string
  locker_number: string
  gender: string
  status: string
}

interface ComboPlan {
  id: string
  combination_key: string
  months: number
  fee: number
}

interface LockerPolicy {
  eligible_combos: string[]
  monthly_fee: number
}

export default function NewAdmissionSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [libraryId, setLibraryId] = useState<string | null>(null)
  
  // Data for selection
  const [seats, setSeats] = useState<Seat[]>([])
  const [lockers, setLockers] = useState<Locker[]>([])
  const [combos, setCombos] = useState<ComboPlan[]>([])
  const [lockerPolicy, setLockerPolicy] = useState<LockerPolicy | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    address: '',
    phone: '',
    gender: 'male',
    shifts: [] as string[],
    seat_id: '',
    locker_id: '',
    has_locker: false,
    plan_months: 1,
    payment_status: 'paid',
    final_price: 0,
    admission_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
    }
  }, [isOpen])

  async function fetchInitialData() {
    setLoadingData(true)
    const { data: { user } } = await supabaseBrowser.auth.getUser()
    if (!user) return

    const { data: staff } = await supabaseBrowser
      .from('staff')
      .select('library_ids')
      .eq('user_id', user.id)
      .single()

    const libId = staff?.library_ids?.[0]
    if (libId) {
      setLibraryId(libId)
      
      const today = new Date().toISOString().split('T')[0]
      const [seatsRes, combosRes, policyRes, lockersRes] = await Promise.all([
        supabaseBrowser
          .from('seats')
          .select('id, seat_number, gender, student_seat_shifts(shift_code, student_id)')
          .eq('library_id', libId)
          .eq('is_active', true)
          .gte('student_seat_shifts.end_date', today),
        supabaseBrowser.from('combo_plans').select('*').eq('library_id', libId),
        supabaseBrowser.from('locker_policies').select('eligible_combos, monthly_fee').eq('library_id', libId).single(),
        supabaseBrowser.from('lockers').select('id, locker_number, gender, status').eq('library_id', libId).eq('status', 'free'),
      ])

      if (seatsRes.data) {
        setSeats(sortSeats(seatsRes.data as any[]))
      }
      
      if (combosRes.data) setCombos(combosRes.data)
      if (policyRes.data) setLockerPolicy(policyRes.data)
      if (lockersRes.data) setLockers(lockersRes.data)
    }
    setLoadingData(false)
  }

  const availableSeats = useMemo(() => {
    return seats.filter(seat => {
      // 1. Gender check
      if (seat.gender !== 'neutral' && seat.gender !== formData.gender) return false

      // 2. Check if ANY of the student's requested shifts are taken on THIS seat by ANYONE
      if (formData.shifts.length > 0) {
        const takenShifts = seat.student_seat_shifts?.map(s => s.shift_code) || []
        const hasOverlap = formData.shifts.some(s => takenShifts.includes(s))
        if (hasOverlap) return false
      }

      return true
    })
  }, [seats, formData.shifts, formData.gender])

  // Sequential scan: Auto-select first available seat as recommended
  useEffect(() => {
    if (availableSeats.length > 0 && !formData.seat_id) {
      setFormData(prev => ({ ...prev, seat_id: availableSeats[0].id }))
    } else if (availableSeats.length === 0 && formData.seat_id) {
      setFormData(prev => ({ ...prev, seat_id: '' }))
    }
    
    // If the currently selected seat is no longer available in the filtered list
    if (formData.seat_id && !availableSeats.find(s => s.id === formData.seat_id)) {
      setFormData(prev => ({ ...prev, seat_id: availableSeats[0]?.id || '' }))
    }
  }, [availableSeats])

  // Memoized values for standard order
  const selectedCombo = useMemo(() => {
    const order = ['M', 'A', 'E', 'N']
    return [...formData.shifts]
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      .join('')
  }, [formData.shifts])

  const isLockerEligible = useMemo(() => {
    return lockerPolicy?.eligible_combos?.includes(selectedCombo) || false
  }, [lockerPolicy, selectedCombo])

  // Auto-reset locker if combo changes and becomes ineligible
  useEffect(() => {
    if (!isLockerEligible && formData.has_locker) {
      setFormData(prev => ({ ...prev, has_locker: false, locker_id: '' }))
    }
  }, [isLockerEligible, formData.has_locker])

  const currentPlan = useMemo(() => {
    return combos.find(c => c.combination_key === selectedCombo && c.months === formData.plan_months)
  }, [combos, selectedCombo, formData.plan_months])
  
  const originalAmount = useMemo(() => {
    const lockerFee = (formData.has_locker && isLockerEligible) ? (lockerPolicy?.monthly_fee || 150) : 0
    return (currentPlan?.fee || 0) + (lockerFee * formData.plan_months)
  }, [currentPlan, formData.has_locker, isLockerEligible, lockerPolicy, formData.plan_months])

  // Sync final_price when originalAmount changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, final_price: originalAmount }))
  }, [originalAmount])

  const discountAmount = originalAmount - formData.final_price

  const handleAdmission = async () => {
    if (!libraryId) return
    setLoading(true)
    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser()
      const { data: staff } = await supabaseBrowser.from('staff').select('role, name').eq('user_id', user?.id).single()

      const res = await submitNewAdmission({
        ...formData,
        selectedCombo
      }, libraryId, discountAmount, staff)

      if (!res.success) {
        throw new Error(res.error)
      }

      setStep(4) 
    } catch (err: any) {
      console.error('Admission error:', err)
      alert('Error during admission: ' + err.message)
    } finally {
      setLoading(false)
    }
  }


  const handleClose = () => {
    if (step === 4) {
      router.refresh()
    }
    onClose()
    setTimeout(() => {
      setStep(1)
      setFormData({
        name: '',
        father_name: '',
        address: '',
        phone: '',
        gender: 'male',
        shifts: [],
        seat_id: '',
        locker_id: '',
        has_locker: false,
        plan_months: 1,
        payment_status: 'paid',
        final_price: 0,
        admission_date: new Date().toISOString().split('T')[0]
      })
    }, 300)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500">
              {step === 1 ? <User className="w-5 h-5" /> : step === 2 ? <Grid className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-serif text-brand-900 leading-tight">New Admission</h2>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3].map(s => (
                  <div key={s} className={cn("h-1 rounded-full transition-all", s === step ? "w-4 bg-brand-500" : "w-1.5 bg-gray-200")} />
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Form Steps */}
        <div className="space-y-6 pb-4">
          
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Student Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none" 
                  placeholder="Rahul Kumar"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Father's Name <span className="text-gray-300">(optional)</span></label>
                <input 
                  type="text" 
                  value={formData.father_name}
                  onChange={e => setFormData({...formData, father_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none" 
                  placeholder="Rajesh Kumar"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address <span className="text-gray-300">(optional)</span></label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none" 
                  placeholder="123, Main Road, Patna"
                />
              </div>

              <PhoneInput 
                value={formData.phone}
                onChange={val => setFormData({...formData, phone: val})}
                label="Mobile Number"
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                <div className="flex gap-3">
                  {['male', 'female'].map(g => (
                    <button 
                      key={g}
                      onClick={() => setFormData({...formData, gender: g, seat_id: '', locker_id: ''})}
                      className={cn(
                        "flex-1 py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                        formData.gender === g ? "bg-brand-50 border-brand-500 text-brand-700 shadow-sm" : "bg-white border-gray-100 text-gray-400"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Selected Shifts</label>
                <div className="grid grid-cols-4 gap-2">
                  {['M', 'A', 'E', 'N'].map(s => (
                    <button 
                      key={s}
                      onClick={() => {
                        const newShifts = formData.shifts.includes(s) 
                          ? formData.shifts.filter(sh => sh !== s) 
                          : [...formData.shifts, s]
                        setFormData({...formData, shifts: newShifts, seat_id: ''}) // Reset seat when shift changes
                      }}
                      className={cn(
                        "py-3 rounded-xl border-2 font-black text-xs transition-all",
                        formData.shifts.includes(s) ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-gray-100 text-gray-400"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned Seat</label>
                {formData.shifts.length > 0 ? (
                  <>
                    <select 
                      value={formData.seat_id}
                      onChange={e => setFormData({...formData, seat_id: e.target.value})}
                      className={cn(
                        "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none",
                        availableSeats.length === 0 && "border-red-200 bg-red-50 text-red-500"
                      )}
                    >
                      <option value="">{availableSeats.length > 0 ? 'Select a seat' : 'No seats available'}</option>
                      {availableSeats.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                          {s.seat_number} {idx === 0 ? '(Recommended)' : ''}
                        </option>
                      ))}
                    </select>
                    {availableSeats.length === 0 && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-red-600 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">No seats available for {formData.shifts.join('+')}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs italic">
                    Select shifts first to see available seats.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Locker</label>
                  <button 
                    onClick={() => isLockerEligible && setFormData({...formData, has_locker: !formData.has_locker})}
                    className={cn(
                      "w-full py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                      !isLockerEligible 
                        ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" 
                        : formData.has_locker 
                          ? "bg-brand-50 border-brand-500 text-brand-700 shadow-sm" 
                          : "bg-white border-gray-100 text-gray-400"
                    )}
                  >
                    {!isLockerEligible 
                      ? 'Ineligible for Locker' 
                      : formData.has_locker 
                        ? 'Locker Assigned ✓' 
                        : 'Add Locker?'}
                  </button>
                </div>

                {formData.has_locker && isLockerEligible && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Locker Number</label>
                    <select 
                      value={formData.locker_id}
                      onChange={e => setFormData({...formData, locker_id: e.target.value})}
                      className="w-full bg-brand-50/50 border border-brand-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none font-bold text-brand-700"
                    >
                      <option value="">Select available locker</option>
                      {lockers
                        .filter(l => l.gender === 'neutral' || l.gender === formData.gender)
                        .map(l => (
                          <option key={l.id} value={l.id}>Locker #{l.locker_number}</option>
                        ))
                      }
                    </select>
                    {lockers.filter(l => l.gender === 'neutral' || l.gender === formData.gender).length === 0 && (
                      <p className="text-[9px] text-red-500 font-bold ml-1">No free lockers available for this gender.</p>
                    )}
                  </div>
                )}

                {!isLockerEligible && selectedCombo && (
                  <p className="text-[9px] text-amber-600 font-medium ml-1 italic">
                    Locker only allowed for specific shifts as per policy.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-brand-900 rounded-2xl p-5 text-white space-y-4 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-100/50">Plan Selected</p>
                    <h4 className="text-xl font-serif">{formData.plan_months} Months</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-100/50">Final Payable</p>
                    <p className="text-xl font-black font-mono">
                      {formData.final_price > 0 ? `₹${formData.final_price}` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-100/50">Original: ₹{originalAmount}</span>
                    {discountAmount > 0 && (
                      <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter">Savings: ₹{discountAmount}</span>
                    )}
                  </div>
                  {originalAmount > 0 && (
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      formData.has_locker ? "bg-green-500 text-white" : "bg-brand-500 text-white"
                    )}>
                      Locker: {formData.has_locker ? `Included` : 'None'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Final Price (Editable)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input 
                    type="number" 
                    value={formData.final_price}
                    onChange={e => setFormData({...formData, final_price: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-brand-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Plan Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 6, 12].map(m => (
                    <button 
                      key={m}
                      onClick={() => setFormData({...formData, plan_months: m})}
                      className={cn(
                        "py-3 rounded-xl border-2 font-bold text-xs transition-all",
                        formData.plan_months === m ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-gray-100 text-gray-400"
                      )}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Status</label>
                <div className="flex gap-3">
                  {['paid', 'pending'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setFormData({...formData, payment_status: s})}
                      className={cn(
                        "flex-1 py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                        formData.payment_status === s ? "bg-brand-50 border-brand-500 text-brand-700 shadow-sm" : "bg-white border-gray-100 text-gray-400"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-lg shadow-green-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-brand-900">Admission Successful!</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  {formData.name} has been admitted to seat {seats.find(s => s.id === formData.seat_id)?.seat_number}.
                </p>
              </div>
              <button 
                onClick={handleClose}
                className="w-full bg-brand-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-900/20"
              >
                Close & View Student
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="flex gap-4 pt-4 border-t border-gray-100 mt-4">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-400 active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            ) : null}
            
            <button 
              onClick={() => step === 3 ? handleAdmission() : setStep(step + 1)}
              disabled={
                loading || 
                (step === 1 && (!formData.name || !formData.phone)) || 
                (step === 2 && (!formData.seat_id || formData.shifts.length === 0 || (formData.has_locker && !formData.locker_id))) ||
                (step === 3 && originalAmount === 0)
              }
              className="flex-[2] bg-brand-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {step === 3 ? 'Confirm Admission' : 'Next Step'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
