import { useState, useEffect, useRef, useMemo } from 'react';

interface UseCountdownOptions {
  targetDate: string | Date | null;
  onExpire?: () => void;
  interval?: number; // Update interval in milliseconds (default: 1000ms)
}

interface CountdownResult {
  timeRemaining: number; // milliseconds remaining
  isExpired: boolean;
  formatted: string; // formatted as "MM:SS"
  minutes: number;
  seconds: number;
}

/**
 * Calculate time remaining from target date
 */
function calculateTimeRemaining(targetDate: string | Date | null): number {
  if (!targetDate) return 0;
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const diff = target.getTime() - new Date().getTime();
  return Math.max(0, diff);
}

/**
 * Hook to countdown from a target date
 * @param targetDate - ISO string or Date object representing expiration time
 * @param onExpire - Callback when countdown reaches zero
 * @param interval - Update interval in milliseconds (default: 1000)
 */
export function useCountdown({
  targetDate,
  onExpire,
  interval = 1000,
}: UseCountdownOptions): CountdownResult {
  // Calculate initial state
  const initialTimeRemaining = useMemo(() => calculateTimeRemaining(targetDate), [targetDate]);
  const [timeRemaining, setTimeRemaining] = useState<number>(() => initialTimeRemaining);
  const [isExpired, setIsExpired] = useState<boolean>(() => initialTimeRemaining <= 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);
  const targetRef = useRef<string | Date | null>(targetDate);

  // Update refs when values change
  useEffect(() => {
    onExpireRef.current = onExpire;
    targetRef.current = targetDate;
    
    // Update state when targetDate changes (using requestAnimationFrame to avoid synchronous setState)
    if (targetDate) {
      requestAnimationFrame(() => {
        const newTimeRemaining = calculateTimeRemaining(targetDate);
        setTimeRemaining(newTimeRemaining);
        setIsExpired(newTimeRemaining <= 0);
      });
    } else {
      requestAnimationFrame(() => {
        setTimeRemaining(0);
        setIsExpired(false);
      });
    }
  }, [targetDate, onExpire]);

  useEffect(() => {
    if (!targetDate) {
      return;
    }

    const updateCountdown = () => {
      const currentTarget = targetRef.current;
      if (!currentTarget) {
        return;
      }

      const diff = calculateTimeRemaining(currentTarget);
      
      if (diff <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onExpireRef.current?.();
      } else {
        setTimeRemaining(diff);
        setIsExpired(false);
      }
    };

    // Set up interval
    intervalRef.current = setInterval(updateCountdown, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetDate, interval]);

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    timeRemaining,
    isExpired,
    formatted,
    minutes,
    seconds,
  };
}
