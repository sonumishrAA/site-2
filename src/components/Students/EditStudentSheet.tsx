'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Loader2, User, Grid, CreditCard, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/client'
import PhoneInput from '@/components/ui/PhoneInput'
import { cn, formatPhone, sortSeats } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Seat {
  id: string
  seat_number: string
  gender: string
  student_seat_shifts?: {
    shift_code: string
    student_id: string
  }[]
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

interface EditStudentSheetProps {
  isOpen: boolean
  onClose: () => void
  student: any | null
}

import { updateStudent } from '@/app/actions'

export default function EditStudentSheet({ isOpen, onClose, student }: EditStudentSheetProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [seats, setSeats] = useState<Seat[]>([])
  const [lockers, setLockers] = useState<Locker[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'male',
    shifts: [] as string[],
    seat_id: '',
    locker_id: '',
    has_locker: false,
    payment_status: 'paid'
  })

  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        name: student.name || '',
        phone: student.phone || '',
        gender: student.gender || 'male',
        shifts: student.selected_shifts || student.shift_display?.split('+') || [],
        seat_id: student.seat_id || '',
        locker_id: student.locker_id || '',
        has_locker: !!student.locker_id,
        payment_status: student.payment_status || 'paid'
      })
      fetchInitialData(student.library_id)
    }
  }, [isOpen, student])

  async function fetchInitialData(libId: string) {
    setLoadingData(true)
    const today = new Date().toISOString().split('T')[0]
    const [seatsRes, lockersRes] = await Promise.all([
      supabaseBrowser
        .from('seats')
        .select('id, seat_number, gender, student_seat_shifts(shift_code, student_id)')
        .eq('library_id', libId)
        .eq('is_active', true)
        .gte('student_seat_shifts.end_date', today),
      supabaseBrowser.from('lockers')
        .select('id, locker_number, gender, status')
        .eq('library_id', libId)
        .or(student?.locker_id ? `status.eq.free,id.eq.${student.locker_id}` : 'status.eq.free'),
    ])

    if (seatsRes.data) {
      setSeats(sortSeats(seatsRes.data as any[]))
    }
    
    if (lockersRes.data) setLockers(lockersRes.data)
    setLoadingData(false)
  }

  const availableSeats = useMemo(() => {
    return seats.filter(seat => {
      // 1. Gender check
      if (seat.gender !== 'neutral' && seat.gender !== formData.gender) return false

      // 2. Occupancy check: Is this seat taken by ANYONE ELSE for ANY of the requested shifts?
      if (formData.shifts.length > 0) {
        const otherStudentsShifts = seat.student_seat_shifts?.filter(s => s.student_id !== student?.id) || []
        const takenShifts = otherStudentsShifts.map(s => s.shift_code)
        const hasOverlap = formData.shifts.some(s => takenShifts.includes(s))
        if (hasOverlap) return false
      }
      
      return true
    })
  }, [seats, formData.shifts, formData.gender, student])

  // Recommended seat logic
  useEffect(() => {
    if (availableSeats.length > 0 && !formData.seat_id) {
      setFormData(prev => ({ ...prev, seat_id: availableSeats[0].id }))
    }
    
    // If the currently selected seat is no longer available in the filtered list
    if (formData.seat_id && !availableSeats.find(s => s.id === formData.seat_id)) {
      setFormData(prev => ({ ...prev, seat_id: availableSeats[0]?.id || '' }))
    }
  }, [availableSeats])

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await updateStudent(student.id, {
        ...formData,
        end_date: student.end_date,
        old_locker_id: student.locker_id
      })

      if (!res.success) {
        throw new Error(res.error)
      }

      router.refresh()
      onClose()
    } catch (err: any) {
      alert('Error updating student: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-brand-900 leading-tight">Edit Student</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Updating profile for {student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-5 pb-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Student Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none" 
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Shifts</label>
            <div className="grid grid-cols-4 gap-2">
              {['M', 'A', 'E', 'N'].map(s => (
                <button 
                  key={s}
                  onClick={() => {
                    const newShifts = formData.shifts.includes(s) ? formData.shifts.filter(sh => sh !== s) : [...formData.shifts, s]
                    setFormData({...formData, shifts: newShifts, seat_id: ''})
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
          <div className="space-y-3 pt-2">
            <button 
              onClick={() => setFormData({...formData, has_locker: !formData.has_locker})}
              className={cn(
                "w-full py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                formData.has_locker ? "bg-brand-50 border-brand-500 text-brand-700 shadow-sm" : "bg-white border-gray-100 text-gray-400"
              )}
            >
              {formData.has_locker ? 'Locker Assigned ✓' : 'Add Locker?'}
            </button>

            {formData.has_locker && (
              <select 
                value={formData.locker_id}
                onChange={e => setFormData({...formData, locker_id: e.target.value})}
                className="w-full bg-brand-50/50 border border-brand-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-700 outline-none"
              >
                <option value="">Select available locker</option>
                {lockers.filter(l => l.gender === 'neutral' || l.gender === formData.gender).map(l => (
                  <option key={l.id} value={l.id}>Locker #{l.locker_number}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={loading || !formData.name || !formData.seat_id || formData.shifts.length === 0}
          className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
