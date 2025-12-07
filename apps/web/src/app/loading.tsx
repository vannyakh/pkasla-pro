'use client'
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header Skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo skeleton */}
            <div className="h-8 md:h-10 w-32 animate-shimmer rounded bg-white/20" />
            
            {/* Right Side Actions Skeleton */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="h-9 w-24 animate-shimmer rounded-lg bg-white/20" />
              <div className="h-9 w-24 animate-shimmer rounded-lg bg-white/20" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <main className="flex-1 relative min-h-screen flex items-center justify-center pt-16 md:pt-20 pb-12 md:pb-16 overflow-hidden">
        {/* Background Skeleton */}
        <div className="absolute inset-0 w-full h-full z-0 min-h-screen bg-gray-400">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none"></div>
        </div>

        {/* Animated Overlay Images Skeleton */}
        <div className="absolute inset-0 z-5 pointer-events-none">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`absolute w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 animate-shimmer rounded-full bg-white/20 ${
                i === 1 ? 'top-20 left-10' :
                i === 2 ? 'bottom-32 right-16' :
                i === 3 ? 'top-1/2 right-20' :
                i === 4 ? 'top-1/3 left-1/4' :
                i === 5 ? 'bottom-1/4 left-20' :
                'top-2/3 left-1/3'
              }`}
            />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header Text Skeleton */}
            <div className="mb-3 flex justify-center">
              <div className="h-5 w-48 md:h-6 md:w-56 animate-shimmer rounded bg-white/30" />
            </div>

            {/* Main Title Skeleton */}
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-full max-w-2xl md:h-16 lg:h-20 animate-shimmer rounded-lg bg-white/30" />
            </div>

            {/* Subtitle Skeleton */}
            <div className="mb-6 max-w-2xl mx-auto space-y-2">
              <div className="h-4 w-full animate-shimmer rounded bg-white/25" />
              <div className="h-4 w-5/6 mx-auto animate-shimmer rounded bg-white/25" />
              <div className="h-4 w-4/6 mx-auto animate-shimmer rounded bg-white/25" />
            </div>

            {/* CTA Button Skeleton */}
            <div className="mb-5 flex justify-center">
              <div className="h-12 w-48 md:w-56 animate-shimmer rounded-lg bg-white/30" />
            </div>

            {/* Statistics Skeleton */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-md mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-8 md:h-10 lg:h-12 w-20 md:w-24 mx-auto mb-2 animate-shimmer rounded bg-white/30" />
                  <div className="h-4 w-16 md:w-20 mx-auto animate-shimmer rounded bg-white/25" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-transparent absolute bottom-0 left-0 right-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="h-4 w-64 animate-shimmer rounded bg-white/20" />
          </div>
        </div>
      </footer>
    </div>
  );
}