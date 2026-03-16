'use client'

import { useState } from 'react'
import SeatBox from './SeatBox'
import SeatDetailSheet from './SeatDetailSheet'

export default function InteractiveGrid({ initialSeats, comboPlans }: { initialSeats: any[], comboPlans: any[] }) {
  const [selectedSeat, setSelectedSeat] = useState<any | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSeatClick = (seat: any) => {
    setSelectedSeat(seat)
    setIsSheetOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {initialSeats.map((seat, index) => (
          <SeatBox
            key={seat.id}
            seatNumber={seat.seat_number}
            status={seat.status}
            shiftDisplay={seat.shiftDisplay}
            hasLocker={seat.hasLocker}
            onClick={() => handleSeatClick(seat)}
            animationDelay={index * 30}
          />
        ))}
      </div>

      <SeatDetailSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        detail={selectedSeat}
        comboPlans={comboPlans}
      />
    </>
  )
}
