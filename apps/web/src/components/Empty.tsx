'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface EmptyProps {
  /**
   * Title text to display
   */
  title?: string
  /**
   * Description text to display below title
   */
  description?: string
  /**
   * Custom content to render instead of title/description
   */
  children?: ReactNode
  /**
   * Path to the Lottie animation file
   * @default "/anim/list.lottie"
   */
  animationUrl?: string
  /**
   * Size variant for the animation
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg' | 'xl'
  /**
   * Action button configuration
   */
  action?: {
    label: string
    onClick?: () => void
    href?: string
    icon?: ReactNode
  }
  /**
   * Custom className for the container
   */
  className?: string
  /**
   * Padding variant
   * @default "default"
   */
  padding?: 'none' | 'sm' | 'default' | 'lg'
}

function Empty({
  title,
  description,
  children,
  animationUrl = '/anim/list.lottie',
  size = 'default',
  action,
  className,
  padding = 'default',
}: EmptyProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.1,
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

  const paddingClasses = {
    none: '',
    sm: 'py-8 px-4',
    default: 'py-16 px-6',
    lg: 'py-24 px-8',
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center',
        paddingClasses[padding],
        className
      )}
    >
      {/* Lottie Animation */}
      <motion.div
        variants={animationVariants}
        className={cn('mb-6 flex items-center justify-center', sizeClasses[size])}
      >
        <DotLottieReact
          src={animationUrl}
          loop
          autoplay
          className="w-full h-full"
        />
      </motion.div>

      {/* Content */}
      {(title || description || children) && (
        <motion.div
          variants={itemVariants}
          className="text-center max-w-md"
        >
          {children ? (
            children
          ) : (
            <>
              {title && (
                <h3 className="text-xl font-light mb-2 text-foreground">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-muted-foreground text-center mb-6">
                  {description}
                </p>
              )}
            </>
          )}

          {/* Action Button */}
          {action && (
            <motion.div
              variants={itemVariants}
              className="mt-6"
            >
              {action.href ? (
                <Button asChild>
                  <a href={action.href}>
                    {action.icon}
                    {action.label}
                  </a>
                </Button>
              ) : (
                <Button onClick={action.onClick}>
                  {action.icon}
                  {action.label}
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default Empty
