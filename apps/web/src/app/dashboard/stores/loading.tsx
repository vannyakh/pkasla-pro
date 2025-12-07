import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StoresLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Search and Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input Skeleton */}
        <div className="relative flex-1">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* Category Select Skeleton */}
        <Skeleton className="w-full sm:w-40 h-9 rounded-md" />
        {/* Premium/Free Select Skeleton */}
        <Skeleton className="w-full sm:w-32 h-9 rounded-md" />
      </div>

      {/* Template Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="border border-gray-200 shadow-none overflow-hidden p-0">
            {/* Image Preview Skeleton */}
            <div className="relative w-full aspect-3/2 bg-gray-100">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
            <CardContent className="p-4 space-y-1">
              {/* Price Skeleton */}
              <Skeleton className="h-4 w-24" />
              {/* Category Skeleton */}
              <Skeleton className="h-3 w-32" />
              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="flex-1 h-8 rounded-md" />
                <Skeleton className="flex-1 h-8 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}

