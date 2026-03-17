'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Loader2, ChevronDown, CheckCircle2, Lock, RefreshCw } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { cn, sortSeats } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { renewStudent } from '@/app/actions'

interface Seat {
  id: string
  seat_number: string
  gender: string
  students?: { id: string; selected_shifts: string[]; end_date: string }[]
  activeBookedShifts?: string[]
}
interface Locker { id: string; locker_number: string; gender: string; status: string }
interface ComboPlan { id: string; combination_key: string; months: number; fee: number }
interface LockerPolicy { eligible_combos: string[]; monthly_fee: number }

interface RenewStudentSheetProps {
  isOpen: boolean
  onClose: () => void
  student: any
}

export default function RenewStudentSheet({ isOpen, onClose, student }: RenewStudentSheetProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [seats, setSeats] = useState<Seat[]>([])
  const [lockers, setLockers] = useState<Locker[]>([])
  const [combos, setCombos] = useState<ComboPlan[]>([])
  const [lockerPolicy, setLockerPolicy] = useState<LockerPolicy | null>(null)
  const [isSeatDropdownOpen, setIsSeatDropdownOpen] = useState(false)
  const [libraryId, setLibraryId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    shifts: [] as string[],
    seat_id: '',
    locker_id: '',
    has_locker: false,
    plan_months: 1,
    payment_status: 'paid' as string,
    amount_paid: 0,
    discount_amount: 0,
    renewal_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (isOpen && student) {
      // Pre-fill from existing student data
      setFormData({
        shifts: student.selected_shifts || [],
        seat_id: student.seat_id || '',
        locker_id: student.locker_id || '',
        has_locker: !!student.locker_id,
        plan_months: 1,
        payment_status: 'paid',
        amount_paid: 0,
        discount_amount: 0,
        renewal_date: new Date().toISOString().split('T')[0],
      })
      fetchData()
    }
  }, [isOpen, student])

  async function fetchData() {
    setLoadingData(true)
    const { data: { user } } = await supabaseBrowser.auth.getUser()
    if (!user) return

    const cookieLibId = document.cookie.match(/active_library_id=([^;]+)/)?.[1]
    const { data: staff } = await supabaseBrowser
      .from('staff')
      .select('library_ids')
      .eq('user_id', user.id)
      .single()

    const libId = cookieLibId || staff?.library_ids?.[0]
    if (!libId) return
    setLibraryId(libId)

    const [seatsRes, combosRes, policyRes, lockersRes] = await Promise.all([
      supabaseBrowser
        .from('seats')
        .select('id, seat_number, gender, students(id, selected_shifts, end_date)')
        .eq('library_id', libId)
        .eq('is_active', true),
      supabaseBrowser.from('combo_plans').select('*').eq('library_id', libId),
      supabaseBrowser.from('locker_policies').select('eligible_combos, monthly_fee').eq('library_id', libId).single(),
      supabaseBrowser.from('lockers').select('id, locker_number, gender, status').eq('library_id', libId),
    ])

    if (seatsRes.data) setSeats(sortSeats(seatsRes.data as any[]))
    if (combosRes.data) setCombos(combosRes.data)
    if (policyRes.data) setLockerPolicy(policyRes.data)
    if (lockersRes.data) setLockers(lockersRes.data)
    setLoadingData(false)
  }

  const SHIFT_LABELS: Record<string, string> = { M: 'Morning', A: 'Afternoon', E: 'Evening', N: 'Night' }

  const selectedCombo = useMemo(() => {
    const order = ['M', 'A', 'E', 'N']
    return [...formData.shifts].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join('')
  }, [formData.shifts])

  // Available seats — include the student's own current seat even if occupied by them
  const availableSeats = useMemo(() => {
    if (formData.shifts.length === 0) return []

    return sortSeats(seats).map(seat => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const activeBookedShifts: string[] = []
      if ((seat as any).students) {
        for (const s of (seat as any).students) {
          // Skip the current student's own bookings — they keep their seat
          if (s.id === student?.id) continue
          if (!s.end_date) continue
          const end = new Date(s.end_date)
          end.setHours(0, 0, 0, 0)
          if (end >= today && s.selected_shifts) {
            activeBookedShifts.push(...s.selected_shifts)
          }
        }
      }
      return { ...seat, activeBookedShifts }
    }).filter(seat => {
      if (seat.gender !== 'neutral' && seat.gender !== student?.gender) return false
      return formData.shifts.every(requestedShift => !seat.activeBookedShifts!.includes(requestedShift))
    })
  }, [seats, formData.shifts, student])

  // Auto-select current seat or first available
  useEffect(() => {
    if (availableSeats.length > 0) {
      const currentSeatStillAvailable = availableSeats.find(s => s.id === student?.seat_id)
      if (currentSeatStillAvailable && !formData.seat_id) {
        setFormData(prev => ({ ...prev, seat_id: currentSeatStillAvailable.id }))
      } else if (!formData.seat_id || !availableSeats.find(s => s.id === formData.seat_id)) {
        setFormData(prev => ({ ...prev, seat_id: availableSeats[0]?.id || '' }))
      }
    } else {
      setFormData(prev => ({ ...prev, seat_id: '' }))
    }
  }, [availableSeats])

  const isLockerEligible = useMemo(
    () => lockerPolicy?.eligible_combos?.includes(selectedCombo) || false,
    [lockerPolicy, selectedCombo]
  )

  // Available lockers — include the student's own current locker
  const eligibleLockers = useMemo(() => {
    return lockers.filter(l => {
      const genderMatch = l.gender === student?.gender || l.gender === 'neutral'
      const isAvailable = l.status === 'free' || l.id === student?.locker_id
      return genderMatch && isAvailable
    })
  }, [lockers, student])

  useEffect(() => {
    if (!isLockerEligible && formData.has_locker) {
      setFormData(prev => ({ ...prev, has_locker: false, locker_id: '' }))
    }
  }, [isLockerEligible])

  const currentPlan = useMemo(
    () => combos.find(c => c.combination_key === selectedCombo && c.months === formData.plan_months),
    [combos, selectedCombo, formData.plan_months]
  )

  const lockerMonthlyFee = isLockerEligible ? (lockerPolicy?.monthly_fee || 0) : 0
  const totalFee = currentPlan ? (currentPlan.fee + lockerMonthlyFee * formData.plan_months) : 0

  const availableMonths = useMemo(
    () => Array.from(new Set(combos.filter(c => c.combination_key === selectedCombo).map(c => c.months))).sort((a, b) => a - b),
    [combos, selectedCombo]
  )

  const canSubmit = formData.shifts.length > 0 && !!formData.seat_id && !!currentPlan

  const handleRenew = async () => {
    if (!libraryId || !currentPlan || !student) return
    setLoading(true)

    const result = await renewStudent({
      student_id: student.id,
      library_id: libraryId,
      selected_shifts: formData.shifts,
      shift_display: selectedCombo,
      seat_id: formData.seat_id,
      locker_id: (formData.has_locker && isLockerEligible) ? (formData.locker_id || null) : null,
      old_locker_id: student.locker_id || null,
      plan_months: formData.plan_months,
      payment_status: formData.payment_status,
      total_fee: totalFee,
      amount_paid: formData.payment_status === 'partial' ? formData.amount_paid : (formData.payment_status === 'discounted' ? totalFee - formData.discount_amount : (formData.payment_status === 'paid' ? totalFee : 0)),
      discount_amount: formData.payment_status === 'discounted' ? formData.discount_amount : 0,
      monthly_rate: currentPlan.fee / formData.plan_months,
      renewal_date: formData.renewal_date,
    })

    setLoading(false)
    if (result.success) {
      router.refresh()
      onClose()
    } else {
      alert(result.error || 'Something went wrong')
    }
  }

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-brand-500" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Renew — {student.name}</h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Current Seat: {student.seats?.seat_number || '??'} · {student.shift_display}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-5">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <>
              {/* Shifts */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Shifts *</label>
                <div className="grid grid-cols-4 gap-2">
                  {['M', 'A', 'E', 'N'].map(s => (
                    <button key={s}
                      onClick={() => {
                        const newShifts = formData.shifts.includes(s)
                          ? formData.shifts.filter(sh => sh !== s)
                          : [...formData.shifts, s]
                        setFormData({ ...formData, shifts: newShifts, seat_id: '' })
                      }}
                      className={cn('py-3 rounded-xl border-2 font-black text-xs transition-all flex flex-col items-center gap-0.5',
                        formData.shifts.includes(s) ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-100 text-gray-400'
                      )}>
                      <span className="text-base">{s}</span>
                      <span className="text-[8px] font-bold opacity-70">{SHIFT_LABELS[s]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seat Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Assign Seat {formData.shifts.length > 0 && `(${availableSeats.length} available)`}
                </label>
                {formData.shifts.length === 0 ? (
                  <div className="p-4 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs italic">
                    Select shifts above to see available seats
                  </div>
                ) : availableSeats.length === 0 ? (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-xs font-bold text-red-700 text-center">
                    No seats available for this combination
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSeatDropdownOpen(!isSeatDropdownOpen)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none flex justify-between items-center"
                    >
                      <span className="font-bold text-gray-800">
                        {formData.seat_id
                          ? `Seat ${availableSeats.find(s => s.id === formData.seat_id)?.seat_number || ''}`
                          : 'Select a seat...'}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isSeatDropdownOpen && "rotate-180")} />
                    </button>
                    {isSeatDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto z-50 p-2 space-y-1">
                        {availableSeats.map((s, idx) => (
                          <button
                            key={s.id}
                            onClick={() => { setFormData({ ...formData, seat_id: s.id }); setIsSeatDropdownOpen(false) }}
                            type="button"
                            className={cn("w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border",
                              formData.seat_id === s.id ? "border-brand-500 bg-brand-50/50" : "border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-900 w-10 text-left">{s.seat_number}</span>
                              {s.id === student?.seat_id && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">CURRENT</span>}
                            </div>
                            <div className="flex gap-1 w-28">
                              {['M', 'A', 'E', 'N'].map(shiftCode => {
                                const isOccupied = s.activeBookedShifts?.includes(shiftCode)
                                return (
                                  <div key={shiftCode} className={cn(
                                    "flex-1 py-1 rounded text-[10px] font-black text-center border",
                                    isOccupied ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"
                                  )}>
                                    {shiftCode}
                                  </div>
                                )
                              })}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Locker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Locker</label>
                <button
                  onClick={() => {
                    if (!isLockerEligible || eligibleLockers.length === 0) return
                    if (formData.has_locker) {
                      setFormData({ ...formData, has_locker: false, locker_id: '' })
                    } else {
                      setFormData({ ...formData, has_locker: true, locker_id: student?.locker_id || eligibleLockers[0]?.id || '' })
                    }
                  }}
                  className={cn('w-full py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2',
                    (!isLockerEligible || eligibleLockers.length === 0) ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                      : formData.has_locker ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                  )}>
                  {!isLockerEligible
                    ? `Locker not available for ${selectedCombo || '—'} combo`
                    : eligibleLockers.length === 0
                      ? 'No lockers available'
                      : formData.has_locker
                        ? `✓ Locker included (+₹${lockerPolicy?.monthly_fee || 0}/mo)`
                        : 'Add Locker'}
                </button>
                {formData.has_locker && isLockerEligible && eligibleLockers.length > 0 && (
                  <select
                    value={formData.locker_id}
                    onChange={e => setFormData({ ...formData, locker_id: e.target.value })}
                    className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none text-brand-900 font-medium mt-2"
                  >
                    {eligibleLockers.map(l => (
                      <option key={l.id} value={l.id}>
                        Locker {l.locker_number} ({l.gender === 'neutral' ? 'Unisex' : l.gender})
                        {l.id === student?.locker_id ? ' — Current' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Plan Duration */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Plan Duration *</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableMonths.map(m => (
                    <button key={m} onClick={() => setFormData({ ...formData, plan_months: m })}
                      className={cn('py-3 rounded-xl border-2 font-bold text-sm transition-all',
                        formData.plan_months === m ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-100 text-gray-500'
                      )}>
                      {m} Month{m > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
                {availableMonths.length === 0 && formData.shifts.length > 0 && (
                  <p className="text-xs text-red-500 font-medium">No plans configured for {selectedCombo}. Go to Settings.</p>
                )}
              </div>

              {/* Fee Summary */}
              {currentPlan && (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fee Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Seat ({selectedCombo} · {formData.plan_months}mo)</span>
                    <span className="font-bold text-gray-900">₹{currentPlan.fee.toLocaleString()}</span>
                  </div>
                  {formData.has_locker && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Locker ({formData.plan_months}mo)</span>
                      <span className="font-bold text-gray-900">₹{(lockerMonthlyFee * formData.plan_months).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black border-t border-gray-200 pt-2 mt-1">
                    <span className="text-gray-800">Total</span>
                    <span className="text-brand-600">₹{totalFee.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Payment Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'paid', label: '✅ Paid' },
                    { v: 'pending', label: '⏳ Pending' },
                    { v: 'partial', label: '💰 Partial' },
                    { v: 'discounted', label: '🏷️ Discount' },
                  ].map(({ v, label }) => (
                    <button key={v} onClick={() => setFormData({ ...formData, payment_status: v })}
                      className={cn('py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all',
                        formData.payment_status === v ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-100 text-gray-400'
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Partial Payment Amount */}
              {formData.payment_status === 'partial' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Amount Paid</label>
                  <input type="number" value={formData.amount_paid || ''}
                    onChange={e => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-blue-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 font-mono font-bold"
                    placeholder="Enter amount paid" min={0} max={totalFee} />
                  {formData.amount_paid > 0 && (
                    <p className="text-xs font-bold text-red-500 ml-1">Remaining: ₹{(totalFee - formData.amount_paid).toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* Discount Amount */}
              {formData.payment_status === 'discounted' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Discount Amount</label>
                  <input type="number" value={formData.discount_amount || ''}
                    onChange={e => setFormData({ ...formData, discount_amount: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-purple-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 font-mono font-bold"
                    placeholder="Enter discount amount" min={0} max={totalFee} />
                  {formData.discount_amount > 0 && (
                    <p className="text-xs font-bold text-green-600 ml-1">Final Price: ₹{(totalFee - formData.discount_amount).toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* Renewal Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Renewal Start Date</label>
                <input type="date" value={formData.renewal_date}
                  onChange={e => setFormData({ ...formData, renewal_date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500" />
              </div>
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-6 pt-3 border-t border-gray-100 bg-white">
          <button
            onClick={handleRenew}
            disabled={loading || !canSubmit}
            className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold text-sm hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Renewing…</> : <>Renew Subscription <CheckCircle2 className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
