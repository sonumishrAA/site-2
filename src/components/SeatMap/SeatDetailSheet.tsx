'use client'

import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import StatusBadge from '../ui/StatusBadge'
import { whatsappLink, daysUntil } from '@/lib/utils'
import { Phone, RefreshCcw, LogOut, CreditCard, MoveHorizontal, User, Clock, MapPin, Lock, ChevronDown, ChevronUp, IndianRupee, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

type ShiftOccupancy = {
  shift: string
  status: 'occupied' | 'expiring' | 'expired' | 'vacant'
  studentName: string | null
  endDate: string | null
  daysLeft: number | null
  student: any | null
}

export type SeatDetail = {
  id: string
  seat_number: string
  gender: string
  status: 'free' | 'occupied' | 'expiring' | 'expired'
  shiftOccupancy?: ShiftOccupancy[]
}

const shiftFullName: Record<string, string> = {
  'M': 'Morning',
  'A': 'Afternoon',
  'E': 'Evening',
  'N': 'Night'
}

const shiftColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  occupied: { bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200', dot: 'bg-brand-500' },
  expiring: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  expired: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  vacant: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', dot: 'bg-green-400' },
}

export default function SeatDetailSheet({
  isOpen,
  onClose,
  detail,
  comboPlans,
}: {
  isOpen: boolean
  onClose: () => void
  detail: SeatDetail | null
  comboPlans: any[]
}) {
  const [expandedShift, setExpandedShift] = useState<string | null>(null)

  // Renew UI state
  const [renewPlanMonths, setRenewPlanMonths] = useState<number>(1)
  const [renewPaymentStatus, setRenewPaymentStatus] = useState<'paid' | 'pending'>('paid')

  if (!detail) return null

  // Function to calculate final price
  const calculateFinalPrice = (months: number) => {
    // Find combo plan if any
    const shiftCount = 1 // Basic assumption; would need real shift count for student
    const combo = comboPlans.find(p => p.shift_count === shiftCount && p.months === months)
    let price = combo ? combo.price : (900 * months) // default 900 fallback
    return price
  }

  const handleRenew = (studentId: string) => {
    console.log('Renewing student:', studentId, 'for months:', renewPlanMonths, 'status:', renewPaymentStatus)
    // Needs actual API call
    alert('Renew implementation would trigger here.')
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={() => {
      setExpandedShift(null)
      onClose()
    }} title={`Seat ${detail.seat_number}`}>
      <div className="space-y-4">
        {/* Per-Shift Occupancy Accordion */}
        {detail.shiftOccupancy && detail.shiftOccupancy.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shift Details</h4>
            <div className="space-y-2">
              {detail.shiftOccupancy.map((shift, idx) => {
                const colors = shiftColors[shift.status]
                const isExpanded = expandedShift === shift.shift
                const activeStudent = shift.student

                return (
                  <div
                    key={shift.shift}
                    className={cn(
                      "rounded-2xl border transition-all duration-300 overflow-hidden",
                      isExpanded ? "border-brand-200 shadow-sm" : colors.border,
                      !isExpanded ? colors.bg : "bg-white"
                    )}
                    style={{ animation: `fadeInUp 0.3s ease-out ${idx * 60}ms both` }}
                  >
                    {/* Header Row (Always visible) */}
                    <button
                      onClick={() => {
                        if (shift.status !== 'vacant') {
                          setExpandedShift(isExpanded ? null : shift.shift)
                          setRenewPlanMonths(activeStudent?.plan_months || 1)
                        }
                      }}
                      disabled={shift.status === 'vacant'}
                      className="w-full flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* Shift badge */}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border shadow-sm",
                          shift.status === 'vacant'
                            ? 'bg-gray-100 border-gray-200 text-gray-400 shadow-none'
                            : shift.status === 'occupied'
                              ? 'bg-brand-500 border-brand-600 text-white'
                              : shift.status === 'expiring'
                                ? 'bg-amber-500 border-amber-600 text-white'
                                : 'bg-red-500 border-red-600 text-white'
                        )}>
                          {shift.shift}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {shiftFullName[shift.shift] || shift.shift}
                          </span>
                          {shift.studentName ? (
                            <span className={cn("text-[15px] font-black leading-tight truncate max-w-[140px]", isExpanded ? "text-gray-900" : colors.text)}>
                              {shift.studentName}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-gray-400 leading-tight">
                              Vacant
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side info & Caret */}
                      <div className="flex items-center gap-2">
                        {shift.status !== 'vacant' && activeStudent && (
                          <div className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            activeStudent.payment_status === 'paid'
                              ? "bg-green-50 text-green-600 border-green-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {activeStudent.payment_status}
                          </div>
                        )}
                        {shift.status === 'vacant' ? (
                          <div className="flex items-center gap-1.5 px-2">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Free</span>
                          </div>
                        ) : shift.status === 'expiring' ? (
                          <div className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-black uppercase">
                            {shift.daysLeft}d left
                          </div>
                        ) : shift.status === 'expired' ? (
                          <div className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-[9px] font-black uppercase">
                            Expired
                          </div>
                        ) : null}

                        {shift.status !== 'vacant' && (
                          <div className={cn("p-1 rounded-full transition-transform", isExpanded ? "bg-gray-100" : "bg-white/50")}>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && activeStudent && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white">

                        {/* Student Details Grid */}
                        <div className="bg-gray-50 rounded-2xl p-4 mt-3 space-y-3 border border-gray-100/50">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Contact & Father</span>
                              <span className="text-xs font-bold text-gray-700 truncate">
                                {activeStudent.phone} • {activeStudent.father_name || 'No father name'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Address</span>
                              <span className="text-xs font-bold text-gray-700 truncate">
                                {activeStudent.address || 'No address provided'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2 border-t border-gray-100/80">
                            <div className="flex-1 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Fee</span>
                                <span className="text-xs font-black text-gray-800 font-mono">₹{activeStudent.total_fee || 0}</span>
                              </div>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <div className={cn(
                                "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0",
                                activeStudent.locker_id ? "bg-brand-50 border-brand-100" : "bg-white border-gray-100"
                              )}>
                                <Lock className={cn("w-3.5 h-3.5", activeStudent.locker_id ? "text-brand-500" : "text-gray-400")} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Locker</span>
                                <span className={cn("text-xs font-bold truncate", activeStudent.locker_id ? "text-brand-700" : "text-gray-400")}>
                                  {activeStudent.locker_id ? `Assigned` : 'None'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3">
                          <button className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:bg-gray-100 p-2.5 rounded-xl font-bold text-xs transition-colors">
                            <CreditCard className="w-3.5 h-3.5" />
                            Edit Student
                          </button>
                        </div>

                        {/* Renew UI for Expired / Expiring */}
                        {(shift.status === 'expired' || shift.status === 'expiring') && (
                          <div className="mt-4 p-4 bg-brand-900 rounded-2xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />

                            <h5 className="font-serif text-lg mb-3">Renew Subscription</h5>

                            <div className="space-y-3 relative z-10">
                              <div className="grid grid-cols-4 gap-2">
                                {[1, 3, 6, 12].map(m => (
                                  <button
                                    key={m}
                                    onClick={() => setRenewPlanMonths(m)}
                                    className={cn(
                                      "py-2 rounded-lg text-[10px] font-bold transition-all",
                                      renewPlanMonths === m ? "bg-brand-500 text-white shadow-sm" : "bg-white/10 text-white/70 hover:bg-white/20"
                                    )}
                                  >
                                    {m}M
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                                <div>
                                  <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest">Final Price</p>
                                  <p className="text-xl font-black font-mono">₹{calculateFinalPrice(renewPlanMonths)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest mb-1">Status</p>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setRenewPaymentStatus('paid')}
                                      className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase", renewPaymentStatus === 'paid' ? "bg-green-500 text-white" : "bg-white/10 text-white/50")}
                                    >
                                      Paid
                                    </button>
                                    <button
                                      onClick={() => setRenewPaymentStatus('pending')}
                                      className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase", renewPaymentStatus === 'pending' ? "bg-amber-500 text-white" : "bg-white/10 text-white/50")}
                                    >
                                      Pending
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRenew(activeStudent.id)}
                                className="w-full bg-white text-brand-900 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-brand-50 transition-colors"
                              >
                                Confirm Renewal →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Free Seat Full Admission Button */}
        {detail.status === 'free' && !detail.shiftOccupancy?.some(s => s.status !== 'vacant') && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✨
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Seat {detail.seat_number} is Free</h3>
              <p className="text-sm text-gray-500">Admit a new student to this seat.</p>
            </div>
            <button className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-100 active:scale-95 transition-transform">
              Close
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
