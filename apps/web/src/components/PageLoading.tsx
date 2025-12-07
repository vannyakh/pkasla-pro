'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { cn } from '@/lib/utils'

interface PageLoadingProps {
  /**
   * Path to the Lottie animation file
   * @default "/anim/HandFlying.lottie"
   */
  animationUrl?: string
  /**
   * Loading text to display below the animation
   * @default "Loading..."
   */
  text?: string
  /**
   * Size variant for the animation
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg' | 'xl'
  /**
   * Whether to show as full screen
   * @default true
   */
  fullScreen?: boolean
  /**
   * Custom className for the container
   */
  className?: string
}

function PageLoading({
  animationUrl = '/anim/HandFlying.lottie',
  text = 'Loading...',
  size = 'default',
  fullScreen = true,
  className,
}: PageLoadingProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  const animationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  const sizeClasses = {
    sm: 'w-32 h-32 md:w-40 md:h-40',
    default: 'w-64 h-64 md:w-80 md:h-80',
    lg: 'w-80 h-80 md:w-96 md:h-96',
    xl: 'w-96 h-96 md:w-[28rem] md:h-[28rem]',
  }

  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-background'
    : 'flex items-center justify-center py-16'

  return (
    <div className={cn(containerClass, className)}>
      <motion.div
        className="flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Lottie Animation */}
        <motion.div
          variants={animationVariants}
          className={cn(sizeClasses[size])}
        >
          <DotLottieReact
            src={animationUrl}
            loop
            autoplay
            className="w-full h-full"
          />
        </motion.div>

        {/* Loading Text */}
        {text && (
          <motion.div
            variants={animationVariants}
            className="mt-8"
          >
            <p className="text-muted-foreground text-sm md:text-base font-light">
              {text}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default PageLoading
