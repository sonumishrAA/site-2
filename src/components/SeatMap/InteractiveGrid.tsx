"use client";

import { useState } from "react";
import SeatBox from "./SeatBox";
import SeatDetailSheet from "./SeatDetailSheet";

export default function InteractiveGrid({
  initialSeats,
  comboPlans,
}: {
  initialSeats: any[];
  comboPlans: any[];
}) {
  const [selectedSeat, setSelectedSeat] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 auto-rows-max w-full overflow-x-auto pb-2">
        {initialSeats.map((seat, index) => (
          <SeatBox
            key={seat.id}
            seatNumber={seat.seat_number}
            overallStatus={seat.status}
            shifts={seat.shiftOccupancy || []}
            hasLocker={seat.hasLocker}
            onClick={() => {
              setSelectedSeat(seat);
              setIsSheetOpen(true);
            }}
            animationDelay={index * 25}
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
  );
}
