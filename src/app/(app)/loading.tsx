import { Skeleton } from "@/components/ui/Skeleton"

export default function DashboardLoading() {
  return (
    <div className="p-4 space-y-6 pb-24 max-w-7xl mx-auto w-full">
      {/* Expired card skeleton */}
      <div className="bg-red-50 border-l-4 border-red-200 rounded-xl p-4 flex gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-2 w-16" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-[2rem]" />
        <Skeleton className="h-32 w-full rounded-[2rem]" />
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-24 rounded ml-1" />
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 flex gap-3">
              <Skeleton className="w-2 h-2 rounded-full mt-1.5 shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-2 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
