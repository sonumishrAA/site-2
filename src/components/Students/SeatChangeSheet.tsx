'use client'

import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { MoveHorizontal, LayoutGrid, CheckCircle2, ChevronRight } from 'lucide-react'

export default function SeatChangeSheet({
  isOpen,
  onClose,
  student,
  vacantSeats,
}: {
  isOpen: boolean
  onClose: () => void
  student: any
  vacantSeats: { id: string, seat_number: string }[]
}) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSeatChange = () => {
    // API logic to swap seat
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className="py-8 text-center space-y-6">
          <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto text-4xl">
            <MoveHorizontal className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-brand-900">Seat Changed</h2>
            <p className="text-sm text-gray-500">{student?.name} moved to Seat {vacantSeats.find(s => s.id === selectedSeat)?.seat_number}</p>
          </div>
          <button onClick={onClose} className="w-full bg-brand-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-900/20">
            Done
          </button>
        </div>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Change Student Seat">
      <div className="space-y-8">
        <div className="flex items-center justify-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Current</p>
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-gray-200 flex items-center justify-center font-mono font-bold text-gray-400">
              {student?.seat_number}
            </div>
          </div>
          <MoveHorizontal className="w-6 h-6 text-brand-500 animate-pulse" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-brand-500 uppercase mb-1">New Seat</p>
            <div className="w-16 h-16 bg-brand-50 rounded-2xl border-2 border-brand-500 flex items-center justify-center font-mono font-bold text-brand-700 shadow-sm shadow-brand-100">
              {vacantSeats.find(s => s.id === selectedSeat)?.seat_number || '?'}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Select Vacant Seat</h3>
          <div className="grid grid-cols-4 gap-2">
            {vacantSeats.map(seat => (
              <button
                key={seat.id}
                onClick={() => setSelectedSeat(seat.id)}
                className={`aspect-square rounded-xl border-2 font-mono font-bold text-sm transition-all ${
                  selectedSeat === seat.id 
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md' 
                    : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                }`}
              >
                {seat.seat_number}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSeatChange}
          disabled={!selectedSeat}
          className="w-full bg-brand-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-900/20 active:scale-95 transition-transform disabled:opacity-50"
        >
          Confirm Seat Swap
        </button>
      </div>
    </BottomSheet>
  )
}
