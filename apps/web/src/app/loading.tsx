'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function Loading() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        className="flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Lottie Animation */}
        <motion.div
          variants={animationVariants}
          className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
        >
          <DotLottieReact
            src="/anim/InviteLoading.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          variants={animationVariants}
          className="mt-8"
        >
          <p className="text-muted-foreground text-sm md:text-base font-light">
            Loading...
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}