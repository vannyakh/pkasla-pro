'use client'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

function EventsLoading() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="relative overflow-hidden p-0 border-0">
            {/* Image Skeleton */}
            <div className="relative h-64 bg-gray-200">
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
              
              {/* Center Content Skeleton */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full px-4">
                <div className="flex flex-col items-center gap-4">
                  {/* Countdown Timer Skeleton */}
                  <div className="w-full flex justify-center">
                    <Skeleton className="h-8 w-32 bg-white/20" />
                  </div>
                  
                  {/* Title Skeleton */}
                  <div className="text-center w-full">
                    <Skeleton className="h-5 w-40 mx-auto mb-2 bg-white/20" />
                    <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section Skeleton */}
            <div className="p-4 bg-white">
              <div className="flex items-start gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-10" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default EventsLoading
