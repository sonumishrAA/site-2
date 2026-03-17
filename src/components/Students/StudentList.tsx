'use client'

import { useState } from 'react'
import { Edit2, Trash2, Lock, MapPin, User, Calendar, IndianRupee, RefreshCw } from 'lucide-react'
import { cn, formatPhone } from '@/lib/utils'
import DeleteStudentDialog from './DeleteStudentDialog'
import EditStudentSheet from './EditStudentSheet'
import RenewStudentSheet from './RenewStudentSheet'
import FeeCollectionSheet from './FeeCollectionSheet'

export default function StudentList({ students, role = 'staff' }: { students: any[], role?: string }) {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; student: any | null }>({
    isOpen: false,
    student: null
  })
  const [editSheet, setEditSheet] = useState<{ isOpen: boolean; student: any | null }>({
    isOpen: false,
    student: null
  })
  const [renewSheet, setRenewSheet] = useState<{ isOpen: boolean; student: any | null }>({
    isOpen: false,
    student: null
  })
  const [feeSheet, setFeeSheet] = useState<{ isOpen: boolean; student: any | null }>({
    isOpen: false,
    student: null
  })

  return (
    <>
      <div className="px-4 mt-28 grid grid-cols-1 md:grid-cols-2 gap-5">
        {students.map((student: any) => {
          const isExpired = new Date(student.end_date) < new Date()
          const daysLeft = Math.ceil((new Date(student.end_date).getTime() - Date.now()) / 86400000)
          const lockerNumber = student.lockers?.locker_number

          return (
            <div 
              key={student.id} 
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all"
              style={{ animation: 'fadeInUp 0.4s ease-out both' }}
            >
              {/* Top Section — Name, Seat, Shifts, Status */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-[10px] shrink-0 border",
                      isExpired ? "bg-red-50 text-red-500 border-red-100" : "bg-brand-50 text-brand-600 border-brand-100"
                    )}>
                      <span className="uppercase opacity-60 text-[7px] tracking-widest mb-0.5">Seat</span>
                      <span className="text-sm leading-none font-mono">{student.seats?.seat_number || '??'}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-gray-900 text-base capitalize truncate tracking-tight">{student.name || 'Unnamed'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {(student.selected_shifts || student.shift_display?.split('+') || []).sort().map((s: string, i: number) => (
                            <span key={s} className="text-[9px] font-black text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md uppercase border border-brand-100/50">{s}</span>
                          ))}
                        </div>
                        {isExpired ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setRenewSheet({ isOpen: true, student }) }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Renew
                          </button>
                        ) : (
                          <>
                            <div className={cn(
                              "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                              student.payment_status === 'paid' 
                                ? "bg-green-50 text-green-600 border-green-100" 
                                : student.payment_status === 'partial'
                                  ? "bg-blue-50 text-blue-600 border-blue-100"
                                  : student.payment_status === 'discounted'
                                    ? "bg-green-50 text-green-600 border-green-100"
                                    : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                              {student.payment_status === 'discounted' ? 'Paid*' : student.payment_status === 'partial' ? 'Partial' : student.payment_status}
                            </div>
                            {student.payment_status === 'partial' && (
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-red-500">
                                  Due: ₹{(student.total_fee || 0) - (student.amount_paid || 0)}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setFeeSheet({ isOpen: true, student }) }}
                                  className="px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                                >
                                  Pay Balance
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditSheet({ isOpen: true, student })}
                      className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {role === 'owner' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteModal({ isOpen: true, student: { id: student.id, name: student.name, seat_number: student.seats?.seat_number, payment_status: student.payment_status, total_fee: student.total_fee, amount_paid: student.amount_paid, discount_amount: student.discount_amount } })
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid — Father, Address, Locker, Fee, Expiry */}
              <div className="px-5 pb-5 pt-0">
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100/50">
                  
                  {/* Father's Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Father</span>
                      <span className="text-xs font-bold text-gray-700 truncate">
                        {student.father_name || <span className="text-gray-300 italic font-medium">Not provided</span>}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Address</span>
                      <span className="text-xs font-bold text-gray-700 truncate">
                        {student.address || <span className="text-gray-300 italic font-medium">Not provided</span>}
                      </span>
                    </div>
                  </div>

                  {/* Locker */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0",
                      lockerNumber ? "bg-brand-50 border-brand-100" : "bg-white border-gray-100"
                    )}>
                      <Lock className={cn("w-3.5 h-3.5", lockerNumber ? "text-brand-500" : "text-gray-400")} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Locker</span>
                      <span className={cn("text-xs font-bold truncate", lockerNumber ? "text-brand-700" : "text-gray-400")}>
                        {lockerNumber ? `#${lockerNumber}` : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Fee + Expiry Row */}
                  <div className="flex gap-3 pt-2 border-t border-gray-100/80">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                        <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Fee</span>
                        <span className="text-xs font-black text-gray-800 font-mono">₹{student.total_fee || 0}</span>
                        {student.payment_status === 'partial' && student.amount_paid != null && (
                          <div className="flex flex-col mt-0.5">
                            <span className="text-[8px] text-blue-600 font-bold">Paid: ₹{student.amount_paid}</span>
                            <span className="text-[8px] text-red-500 font-bold">Due: ₹{(student.total_fee || 0) - (student.amount_paid || 0)}</span>
                          </div>
                        )}
                        {student.payment_status === 'discounted' && student.discount_amount != null && (
                          <div className="flex flex-col mt-0.5">
                            <span className="text-[8px] text-purple-600 font-bold">Discount: ₹{student.discount_amount}</span>
                            <span className="text-[8px] text-green-600 font-bold">Paid: ₹{(student.total_fee || 0) - (student.discount_amount || 0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0",
                        isExpired ? "bg-red-50 border-red-100" : daysLeft <= 7 ? "bg-amber-50 border-amber-100" : "bg-white border-gray-100"
                      )}>
                        <Calendar className={cn(
                          "w-3.5 h-3.5",
                          isExpired ? "text-red-500" : daysLeft <= 7 ? "text-amber-500" : "text-gray-400"
                        )} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Expires</span>
                        <span className={cn(
                          "text-xs font-bold",
                          isExpired ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-gray-700"
                        )}>
                          {isExpired 
                            ? `Expired ${Math.abs(daysLeft)}d ago`
                            : new Date(student.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <EditStudentSheet 
        isOpen={editSheet.isOpen}
        onClose={() => setEditSheet({ isOpen: false, student: null })}
        student={editSheet.student}
      />

      <DeleteStudentDialog 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, student: null })}
        student={deleteModal.student}
      />

      <RenewStudentSheet
        isOpen={renewSheet.isOpen}
        onClose={() => setRenewSheet({ isOpen: false, student: null })}
        student={renewSheet.student}
      />

      <FeeCollectionSheet
        isOpen={feeSheet.isOpen}
        onClose={() => setFeeSheet({ isOpen: false, student: null })}
        student={feeSheet.student}
      />
    </>
  )
}
