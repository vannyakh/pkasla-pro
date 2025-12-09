'use client'

import React, { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { cn } from '@/lib/utils'

interface LottiePlayerProps {
  /**
   * Path to the Lottie animation file
   */
  src: string
  /**
   * Whether to loop the animation
   * @default true
   */
  loop?: boolean
  /**
   * Whether to autoplay the animation
   * @default true
   */
  autoplay?: boolean
  /**
   * Custom className
   */
  className?: string
  /**
   * Fallback content to show if animation fails
   */
  fallback?: React.ReactNode
  /**
   * Callback when animation fails to load
   */
  onError?: (error: Error) => void
}

/**
 * LottiePlayer component with error handling and fallback support
 * Prevents crashes from buffer size mismatches and corrupted files
 */
export function LottiePlayer({
  src,
  loop = true,
  autoplay = true,
  className,
  fallback,
  onError,
}: LottiePlayerProps) {
  const [hasError, setHasError] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Reset error state when src changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasError(false)
  }, [src])

  const handleError = (error: Error) => {
    console.error('Lottie animation failed to load:', error)
    setHasError(true)
    onError?.(error)
  }

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        {fallback || <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg" />}
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        {fallback || (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs">Animation unavailable</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className={cn('flex items-center justify-center', className)}>
            <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs">Animation error</p>
            </div>
          </div>
        )
      }
      onError={handleError}
    >
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={autoplay}
        className={className}
      />
    </ErrorBoundary>
  )
}

// Error Boundary for catching render errors
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    fallback: React.ReactNode
    onError?: (error: Error) => void
  },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode
    fallback: React.ReactNode
    onError?: (error: Error) => void
  }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LottiePlayer Error:', error, errorInfo)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

export default LottiePlayer

