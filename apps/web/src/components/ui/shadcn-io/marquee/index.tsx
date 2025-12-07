'use client';

import type { HTMLAttributes } from 'react';
import { memo } from 'react';
import type { MarqueeProps as FastMarqueeProps } from 'react-fast-marquee';
import FastMarquee from 'react-fast-marquee';
import { cn } from '@/lib/utils';

export type MarqueeProps = HTMLAttributes<HTMLDivElement>;

export const Marquee = memo<MarqueeProps>(
  ({ className, ...props }) => (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      {...props}
    />
  )
);
Marquee.displayName = 'Marquee';

export type MarqueeContentProps = FastMarqueeProps;

export const MarqueeContent = memo<MarqueeContentProps>(
  ({
    loop = 0,
    autoFill = true,
    pauseOnHover = true,
    speed = 50,
    direction = 'left',
    ...props
  }) => (
    <FastMarquee
      autoFill={autoFill}
      loop={loop}
      pauseOnHover={pauseOnHover}
      speed={speed}
      direction={direction}
      {...props}
    />
  )
);
MarqueeContent.displayName = 'MarqueeContent';

export type MarqueeFadeProps = HTMLAttributes<HTMLDivElement> & {
  side: 'left' | 'right';
};

export const MarqueeFade = memo<MarqueeFadeProps>(
  ({ className, side, ...props }) => (
    <div
      className={cn(
        'absolute top-0 bottom-0 z-10 h-full w-24 pointer-events-none',
        side === 'left'
          ? 'left-0 bg-gradient-to-r from-background to-transparent'
          : 'right-0 bg-gradient-to-l from-background to-transparent',
        className
      )}
      {...props}
    />
  )
);
MarqueeFade.displayName = 'MarqueeFade';

export type MarqueeItemProps = HTMLAttributes<HTMLDivElement>;

export const MarqueeItem = memo<MarqueeItemProps>(
  ({ className, ...props }) => (
    <div
      className={cn('mx-2 shrink-0', className)}
      {...props}
    />
  )
);
MarqueeItem.displayName = 'MarqueeItem';
