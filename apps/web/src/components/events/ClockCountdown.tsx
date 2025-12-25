"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ClockCountdownProps {
  targetDate: string | Date;
  variant?: "relative" | "absolute" | "compact";
  className?: string;
}

export function ClockCountdown({
  targetDate,
  variant = "relative",
  className = "",
}: ClockCountdownProps) {
  const countdown = useCountdown({ targetDate });
  const hourHandRef = useRef<HTMLDivElement>(null);
  const minuteHandRef = useRef<HTMLDivElement>(null);
  const secondHandRef = useRef<HTMLDivElement>(null);
  const secondHandShadowRef = useRef<HTMLDivElement>(null);

  // Calculate time units
  const days = Math.floor(countdown.timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countdown.timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (countdown.timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((countdown.timeRemaining % (1000 * 60)) / 1000);

  // Calculate hand angles
  // For countdown: we show remaining time as if it's a clock
  // Hour hand: hours (0-23) mapped to 12-hour dial
  const hourAngle = ((hours % 12) * 30 + minutes * 0.5) % 360;
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;

  // Update hand rotations
  useEffect(() => {
    if (hourHandRef.current) {
      hourHandRef.current.style.transform = `rotate(${hourAngle}deg)`;
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.style.transform = `rotate(${minuteAngle}deg)`;
    }
    if (secondHandRef.current) {
      secondHandRef.current.style.transform = `rotate(${secondAngle}deg)`;
    }
    if (secondHandShadowRef.current) {
      secondHandShadowRef.current.style.transform = `rotate(${secondAngle}deg)`;
    }
  }, [hourAngle, minuteAngle, secondAngle]);

  // Format date for display
  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Handle expired state
  if (countdown.isExpired) {
    return (
      <Card
        className={`flex flex-col items-center justify-center p-4 sm:p-6 h-full min-h-[200px] bg-linear-to-br from-muted/50 to-muted/30 border-border/50 ${className}`}
      >
        <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
        <p className="text-sm sm:text-base font-medium text-muted-foreground text-center">
          ព្រឹត្តិការណ៍បានបញ្ចប់
        </p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          Event has ended
        </p>
      </Card>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Card className={`p-3 bg-card border-border/50 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">
            {days > 0 && `${days}d `}
            {hours.toString().padStart(2, "0")}:
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </Card>
    );
  }

  // Glassmorphic analog clock variant
  const clockSize = 280;
  const center = clockSize / 2;

  // Generate hour numbers and marks
  const hourNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteMarks = Array.from({ length: 60 }, () => 0);

  return (
    <>
      <style>{`
        @property --primary-light-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: -75deg;
        }

        @property --dark-edge-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 105deg;
        }

        .glass-clock-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: ${clockSize}px;
        }

        .glass-effect-wrapper {
          position: relative;
          border-radius: 50%;
          background: transparent;
          pointer-events: none;
          transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1);
        }

        .glass-effect-shadow {
          position: absolute;
          width: calc(100% + 3em);
          height: calc(100% + 3em);
          top: calc(0% - 1.5em);
          left: calc(0% - 1.5em);
          filter: blur(10px);
          pointer-events: none;
          z-index: 1;
          opacity: 0.8;
        }

        .glass-effect-shadow::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.15));
          width: calc(100% - 3em - 0.25em);
          height: calc(100% - 3em - 0.25em);
          top: calc(1.5em - 0.5em);
          left: calc(1.5em - 0.875em);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 15px 25px rgba(0, 0, 0, 0.05),
            0 20px 40px rgba(0, 0, 0, 0.05);
        }

        .glass-clock-face {
          position: relative;
          width: ${clockSize}px;
          height: ${clockSize}px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.03);
          background-image: linear-gradient(
            -75deg,
            rgba(255, 255, 255, 0.01),
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.01)
          );
          backdrop-filter: blur(1px);
          box-shadow: inset 0 0.4em 0.4em rgba(0, 0, 0, 0.1),
            inset 0 -0.4em 0.4em rgba(255, 255, 255, 0.5),
            10px 5px 10px rgba(0, 0, 0, 0.1),
            10px 20px 20px rgba(0, 0, 0, 0.1),
            10px 55px 50px rgba(0, 0, 0, 0.1);
          z-index: 3;
          overflow: hidden;
          pointer-events: auto;
          transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1);
        }

        .glass-clock-face::after {
          content: "";
          position: absolute;
          z-index: 10;
          inset: 0;
          border-radius: 50%;
          width: calc(100% + 2px);
          height: calc(100% + 2px);
          top: -1px;
          left: -1px;
          padding: 2px;
          box-sizing: border-box;
          background: conic-gradient(
              from var(--primary-light-angle) at 50% 50%,
              rgba(255, 255, 255, 1),
              rgba(255, 255, 255, 0.2) 5% 40%,
              rgba(255, 255, 255, 1) 50%,
              rgba(255, 255, 255, 0.2) 60% 95%,
              rgba(255, 255, 255, 1)
            ),
            linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5));
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.9),
            0 0 12px rgba(255, 255, 255, 0.8);
          opacity: 0.9;
        }

        .glass-edge-highlight {
          position: absolute;
          width: ${clockSize}px;
          height: ${clockSize}px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          z-index: 8;
          pointer-events: none;
          opacity: 0.6;
        }

        .glass-edge-shadow {
          position: absolute;
          width: ${clockSize}px;
          height: ${clockSize}px;
          border-radius: 50%;
          box-shadow: inset -5px 5px 15px rgba(0, 0, 0, 0.3),
            inset -8px 8px 20px rgba(0, 0, 0, 0.2);
          z-index: 7;
          pointer-events: none;
        }

        .glass-dark-edge {
          position: absolute;
          z-index: 9;
          inset: 0;
          border-radius: 50%;
          width: calc(100% + 2px);
          height: calc(100% + 2px);
          top: -1px;
          left: -1px;
          padding: 2px;
          box-sizing: border-box;
          background: conic-gradient(
            from var(--dark-edge-angle) at 50% 50%,
            rgba(0, 0, 0, 0.5),
            rgba(0, 0, 0, 0) 5% 40%,
            rgba(0, 0, 0, 0.5) 50%,
            rgba(0, 0, 0, 0) 60% 95%,
            rgba(0, 0, 0, 0.5)
          );
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
        }

        .glass-glossy-overlay {
          position: absolute;
          width: ${clockSize}px;
          height: ${clockSize}px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.7) 15%,
            rgba(255, 255, 255, 0.5) 25%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            rgba(255, 255, 255, 0.1) 100%
          );
          pointer-events: none;
          z-index: 6;
          mix-blend-mode: overlay;
          opacity: 0.3;
          filter: blur(10px);
        }

        .glass-reflection {
          position: absolute;
          width: ${clockSize}px;
          height: ${clockSize / 2}px;
          top: 0;
          left: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.7) 0%,
            rgba(255, 255, 255, 0.4) 40%,
            rgba(255, 255, 255, 0) 100%
          );
          border-radius: ${clockSize / 2}px ${clockSize / 2}px 0 0;
          pointer-events: none;
          z-index: 10;
          mix-blend-mode: soft-light;
          opacity: 0.5;
          filter: blur(10px);
        }

        .clock-hour-marks {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 14;
        }

        .minute-marker {
          position: absolute;
          width: 1px;
          height: 8px;
          background-color: rgba(80, 80, 80, 0.4);
          top: 8px;
          left: ${center}px;
          transform-origin: center ${center - 8}px;
          box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
        }

        .hour-marker {
          position: absolute;
          width: 2px;
          height: 12px;
          background-color: rgba(80, 80, 80, 0.6);
          top: 6px;
          left: ${center - 1}px;
          transform-origin: center ${center - 6}px;
          box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
        }

        .clock-number {
          position: absolute;
          font-size: 14px;
          font-weight: 500;
          color: rgba(50, 50, 50, 0.9);
          text-align: center;
          width: 24px;
          height: 18px;
          line-height: 18px;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
          z-index: 15;
          user-select: none;
          pointer-events: none;
        }

        .clock-date {
          position: absolute;
          font-size: 11px;
          font-weight: 400;
          color: rgba(50, 50, 50, 0.8);
          text-align: center;
          width: 120px;
          bottom: ${center - 20}px;
          left: ${center - 60}px;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
          z-index: 15;
          user-select: none;
        }

        .clock-days {
          position: absolute;
          font-size: 10px;
          font-weight: 400;
          color: rgba(50, 50, 50, 0.7);
          text-align: center;
          width: 120px;
          bottom: ${center - 35}px;
          left: ${center - 60}px;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
          z-index: 15;
          user-select: none;
        }

        .clock-hand {
          position: absolute;
          transform-origin: center bottom;
          bottom: ${center}px;
          left: ${center}px;
          z-index: 15;
          transition: transform 0.3s cubic-bezier(0.4, 2.3, 0.8, 1);
        }

        .hour-hand {
          width: 5px;
          height: ${center * 0.4}px;
          background-color: rgba(50, 50, 50, 0.9);
          margin-left: -2.5px;
          border-radius: 2.5px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }

        .minute-hand {
          width: 3px;
          height: ${center * 0.55}px;
          background-color: rgba(50, 50, 50, 0.9);
          margin-left: -1.5px;
          border-radius: 1.5px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }

        .second-hand-container {
          position: absolute;
          width: 2px;
          height: ${center * 0.65}px;
          top: ${center * 0.2}px;
          left: ${center - 1}px;
          transform-origin: 1px ${center * 0.65}px;
          z-index: 17;
          transition: transform 0.1s linear;
        }

        .second-hand {
          position: absolute;
          width: 2px;
          height: ${center * 0.65}px;
          background-color: rgba(255, 107, 0, 1);
          bottom: 0;
          left: 0;
          box-shadow: 0 0 5px rgba(255, 107, 0, 0.5);
        }

        .second-hand-counterweight {
          position: absolute;
          width: 6px;
          height: 12px;
          background-color: rgba(255, 107, 0, 1);
          bottom: -12px;
          left: -2px;
          border-radius: 0 0 3px 3px;
          box-shadow: 0 0 5px rgba(255, 107, 0, 0.5);
        }

        .second-hand-shadow {
          position: absolute;
          width: 2px;
          height: ${center * 0.65}px;
          top: ${center * 0.2}px;
          left: ${center - 1}px;
          transform-origin: 1px ${center * 0.65}px;
          z-index: 14;
          filter: blur(2px);
          opacity: 0.3;
          transition: transform 0.1s linear;
        }

        .second-hand-shadow::before {
          content: "";
          position: absolute;
          width: 2px;
          height: ${center * 0.65}px;
          background: transparent;
          bottom: 0;
          left: 0;
          box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.15);
        }

        .clock-center-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          background: rgba(255, 107, 0, 1);
          border-radius: 50%;
          top: ${center - 5}px;
          left: ${center - 5}px;
          z-index: 17;
          box-shadow: 0 0 8px rgba(255, 107, 0, 0.4);
        }

        .clock-center-blur {
          position: absolute;
          width: 30px;
          height: 30px;
          top: ${center - 15}px;
          left: ${center - 15}px;
          background-color: rgba(255, 255, 255, 0.35);
          border-radius: 50%;
          backdrop-filter: blur(4px);
          z-index: 16;
          pointer-events: none;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.4),
            inset 0 0 8px rgba(255, 255, 255, 0.6);
        }
      `}</style>

      <Card
        className={`flex flex-col items-center justify-center p-4 sm:p-6 h-full bg-linear-to-br from-muted/20 to-muted/10 border-border/30 ${className}`}
        style={{ minHeight: `${clockSize}px` }}
      >
        <div className="glass-clock-container">
          <div className="glass-effect-wrapper">
            <div className="glass-effect-shadow"></div>
            <div className="glass-clock-face">
              <div className="glass-glossy-overlay"></div>
              <div className="glass-edge-highlight"></div>
              <div className="glass-edge-shadow"></div>
              <div className="glass-dark-edge"></div>
              <div className="glass-reflection"></div>

              {/* Hour marks */}
              <div className="clock-hour-marks">
                {minuteMarks.map((_, mark) => {
                  const angle = mark * 6;
                  const isHour = mark % 5 === 0;
                  return (
                    <div
                      key={mark}
                      className={isHour ? "hour-marker" : "minute-marker"}
                      style={{
                        transform: `rotate(${angle}deg)`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Hour numbers */}
              {hourNumbers.map((num) => {
                const angle = (num * 30 - 90) * (Math.PI / 180);
                const radius = center - 30;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                  <div
                    key={num}
                    className="clock-number"
                    style={{
                      left: `${x - 12}px`,
                      top: `${y - 9}px`,
                    }}
                  >
                    {num}
                  </div>
                );
              })}

              {/* Clock hands */}
              <div
                ref={hourHandRef}
                className="hour-hand clock-hand"
                style={{ transform: `rotate(${hourAngle}deg)` }}
              />
              <div
                ref={minuteHandRef}
                className="minute-hand clock-hand"
                style={{ transform: `rotate(${minuteAngle}deg)` }}
              />

              {/* Second hand shadow */}
              <div
                ref={secondHandShadowRef}
                className="second-hand-shadow"
                style={{ transform: `rotate(${secondAngle}deg)` }}
              />

              {/* Second hand */}
              <div
                ref={secondHandRef}
                className="second-hand-container"
                style={{ transform: `rotate(${secondAngle}deg)` }}
              >
                <div className="second-hand"></div>
                <div className="second-hand-counterweight"></div>
              </div>

              <div className="clock-center-blur"></div>
              <div className="clock-center-dot"></div>

              {/* Date and days display */}
              <div className="clock-date">{formatDate(targetDate)}</div>
              {days > 0 && (
                <div className="clock-days">
                  {days} {days === 1 ? "day" : "days"} left
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
