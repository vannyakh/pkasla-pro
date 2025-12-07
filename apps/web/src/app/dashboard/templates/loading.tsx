import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MyTemplatesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Search Skeleton */}
      <div className="relative">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md absolute right-1 top-1/2 -translate-y-1/2" />
      </div>

      {/* Template Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="border border-gray-200 shadow-none overflow-hidden p-0">
            {/* Image Preview Skeleton */}
            <div className="relative w-full aspect-3/2 bg-gray-100">
              <Skeleton className="w-full h-full rounded-none" />
              {/* Owned Badge Skeleton */}
              <div className="absolute top-2 right-2">
                <Skeleton className="h-6 w-20 rounded-full bg-green-200" />
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              {/* Template Name Skeleton */}
              <Skeleton className="h-4 w-40" />
              {/* Category Skeleton */}
              <Skeleton className="h-3 w-32" />
              {/* Purchase Date Skeleton */}
              <Skeleton className="h-3 w-36" />
              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="flex-1 h-8 rounded-md" />
                <Skeleton className="flex-1 h-8 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
