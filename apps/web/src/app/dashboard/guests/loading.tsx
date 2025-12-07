import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function GuestsLoading() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search and Filters Skeleton */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Guest List Card Skeleton */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header Skeleton */}
          <div className="border-b p-4">
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  {/* Guest Column */}
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  {/* Email Column */}
                  <Skeleton className="h-4 w-40" />
                  {/* Event Column */}
                  <Skeleton className="h-4 w-32" />
                  {/* Status Column */}
                  <Skeleton className="h-6 w-20 rounded-full" />
                  {/* Actions Column */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

