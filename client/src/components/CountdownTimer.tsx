'use client'

import React from 'react'
import { useCountdown } from '@/hooks/useCountdown'

interface CountdownTimerProps {
  targetDate: string | Date
  className?: string
  variant?: 'absolute' | 'relative'
}

export default function CountdownTimer({ targetDate, className = '', variant = 'absolute' }: CountdownTimerProps) {
  const countdown = useCountdown(targetDate)

  const containerClass = variant === 'absolute' 
    ? 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10'
    : 'relative'

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="backdrop-blur-sm rounded-lg px-4 py-3">
        <div className="flex items-center gap-3 text-xs font-semibold text-white drop-shadow-lg">
          <div className="text-center">
            <div className="text-lg font-bold">{countdown.days}</div>
            <div className="text-[10px] text-white/90 uppercase">Days</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{countdown.hours.toString().padStart(2, '0')}</div>
            <div className="text-[10px] text-white/90 uppercase">Hrs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{countdown.minutes.toString().padStart(2, '0')}</div>
            <div className="text-[10px] text-white/90 uppercase">Min</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{countdown.seconds.toString().padStart(2, '0')}</div>
            <div className="text-[10px] text-white/90 uppercase">Sec</div>
          </div>
        </div>
      </div>
    </div>
  )
}

