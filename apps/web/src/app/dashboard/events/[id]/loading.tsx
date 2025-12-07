'use client'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function EventDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Event Info Block Skeleton */}
      <div className="relative bg-gray-200 rounded-xl overflow-hidden border border-gray-200 shadow-lg min-h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-0" />
        <Card className="shadow-none border-none bg-transparent z-10 relative w-full h-full">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Skeleton className="h-8 sm:h-10 md:h-12 w-48 sm:w-64 md:w-80 bg-white/20" />
                <Skeleton className="h-6 w-20 rounded-full bg-white/20" />
              </div>
            </div>
            <Skeleton className="h-8 w-32 bg-white/20 shrink-0" />
          </div>

          {/* Info Cards Grid */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-4 bg-white/30" />
                    <Skeleton className="h-3 w-16 bg-white/30" />
                  </div>
                  <Skeleton className="h-5 w-24 bg-white/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="border-t border-white/20 mb-3 sm:mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-white/20" />
              <Skeleton className="h-4 w-5/6 bg-white/20" />
              <Skeleton className="h-4 w-4/6 bg-white/20" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Section Skeleton */}
      <div className="w-full">
        {/* Desktop Tabs Skeleton */}
        <div className="hidden md:block w-full mb-4 bg-gray-100 p-1 rounded-lg">
          <div className="grid w-full md:grid-cols-4 lg:grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>

        {/* Mobile Bottom Navigation Skeleton */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="grid grid-cols-5 w-full h-16 gap-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-full w-full rounded-none" />
            ))}
          </div>
        </div>

        {/* Tab Content Skeleton */}
        <div className="mt-4 md:mt-4 mb-16 md:mb-4">
          <Card className="p-6">
            <div className="space-y-4">
              {/* Content Header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>

              {/* Content Grid/List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex items-center gap-2 pt-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
