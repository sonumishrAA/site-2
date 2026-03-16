'use client'

import SeatBox from './SeatBox'
import { SeatStatus } from '@/lib/utils'

interface Seat {
  id: string
  seat_number: string
  status: SeatStatus
  shiftDisplay: string
  daysLeft: number | null
  hasLocker: boolean
}

export default function SeatGrid({ seats }: { seats: Seat[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
      {seats.map((seat) => (
        <SeatBox
          key={seat.id}
          seatNumber={seat.seat_number}
          status={seat.status}
          shiftOccupancy={[]}
          hasLocker={seat.hasLocker}
          onClick={() => {
            console.log('Seat clicked:', seat.seat_number)
            // Yahan hum baad mein Bottom Sheet open karne ka logic dalenge
          }}
        />
      ))}
    </div>
  )
}
