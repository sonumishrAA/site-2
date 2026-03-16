import { Skeleton } from "@/components/ui/Skeleton"

export default function StudentsLoading() {
  return (
    <div className="pb-24 max-w-7xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-20 rounded-xl shrink-0" />
          ))}
        </div>
      </div>

      {/* List Skeleton - Matching Real Card Style */}
      <div className="px-4 mt-28 grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-[1.25rem]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-12 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-xl" />
            </div>
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-50/80">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-2xl" />
                <div className="space-y-1">
                  <Skeleton className="h-2 w-10" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2.5">
                <Skeleton className="w-11 h-11 rounded-2xl" />
                <Skeleton className="w-11 h-11 rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
