import { Skeleton } from "@/components/ui/Skeleton"

export default function SeatMapLoading() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12 rounded-lg" />
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-xl" />
          ))}
        </div>

        {/* Seat Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-10 grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
