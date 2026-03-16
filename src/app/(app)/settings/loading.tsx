import { Skeleton } from "@/components/ui/Skeleton"

export default function SettingsLoading() {
  return (
    <div className="p-4 pb-24 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <Skeleton className="h-2 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Infrastructure */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-24 rounded ml-1" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-2 w-32 rounded" />
                </div>
              </div>
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Staff Accounts */}
      <div className="space-y-4">
        <div className="flex justify-between px-1">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-2 w-16 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2 w-1/2" />
            <Skeleton className="h-2 w-1/3" />
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
