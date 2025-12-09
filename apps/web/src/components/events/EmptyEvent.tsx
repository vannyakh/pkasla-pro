'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LottiePlayer } from '@/components/LottiePlayer'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface EmptyEventProps {
  onCreateEvent?: () => void
  animationUrl?: string
}

function EmptyEvent({ onCreateEvent, animationUrl }: EmptyEventProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      {/* Lottie Animation */}
      <div className="mb-6 w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        <LottiePlayer
          src={animationUrl || "https://lottie.host/embed/6b8b5c5e-3f4a-4b5c-9d1e-2f3a4b5c6d7e/empty-calendar.json"}
          loop
          autoplay
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="text-center max-w-md">
        <h3 className="text-xl font-light mb-2">No events yet</h3>
        <p className="text-muted-foreground text-center mb-6">
          Start creating beautiful event invitations and manage your guests in one place.
        </p>
        {onCreateEvent ? (
          <Button onClick={onCreateEvent}>
            Create your first event
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button asChild>
            <Link href="/dashboard/events/new">
              Create your first event
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export default EmptyEvent
