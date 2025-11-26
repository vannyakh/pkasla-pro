'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import type { User } from '@/types'

export function Hero() {
  const { data: session } = useSession()
  const user = session?.user as User | undefined
  const isAuthenticated = !!user

  const heroRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const overlayImage1Ref = useRef<HTMLDivElement>(null)
  const overlayImage2Ref = useRef<HTMLDivElement>(null)
  const overlayImage3Ref = useRef<HTMLDivElement>(null)
  const overlayImage4Ref = useRef<HTMLDivElement>(null)
  const overlayImage5Ref = useRef<HTMLDivElement>(null)
  const overlayImage6Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Animate header
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )

      // Animate title
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' }
      )

      // Animate subtitle
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power3.out' }
      )

      // Animate buttons
      gsap.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: 'power3.out' }
      )

      // Animate stats
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 1.1, ease: 'power3.out' }
      )

      // Animate overlay images
      if (overlayImage1Ref.current) {
        gsap.to(overlayImage1Ref.current, {
          y: -20,
          x: 10,
          rotation: 5,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      if (overlayImage2Ref.current) {
        gsap.to(overlayImage2Ref.current, {
          y: 15,
          x: -15,
          rotation: -5,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.5,
        })
      }

      if (overlayImage3Ref.current) {
        gsap.to(overlayImage3Ref.current, {
          y: -10,
          x: 20,
          rotation: 3,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1,
        })
      }

      if (overlayImage4Ref.current) {
        gsap.to(overlayImage4Ref.current, {
          y: 20,
          x: -10,
          rotation: -3,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.5,
        })
      }

      if (overlayImage5Ref.current) {
        gsap.to(overlayImage5Ref.current, {
          y: -15,
          x: 15,
          rotation: 4,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2,
        })
      }

      if (overlayImage6Ref.current) {
        gsap.to(overlayImage6Ref.current, {
          y: 12,
          x: -20,
          rotation: -4,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2.5,
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-16 md:pt-20 pb-12 md:pb-16 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Animated Overlay Images */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {/* Overlay Image 1 */}
        <div
          ref={overlayImage1Ref}
          className="absolute top-20 left-10 w-24 h-24 md:w-32 md:h-32 opacity-50"
        >
          <Image
            src="https://i.pinimg.com/1200x/97/8d/71/978d715a8ede8b69000f3d0eaf6d8cbc.jpg"
            alt="Decoration"
            fill
            className="object-cover rounded-full"
            sizes="128px"
          />
        </div>

        {/* Overlay Image 2 */}
        <div
          ref={overlayImage2Ref}
          className="absolute bottom-32 right-16 w-20 h-20 md:w-28 md:h-28 opacity-50"
        >
          <Image
            src="https://i.pinimg.com/1200x/12/48/ce/1248ceaa77a70877f81e3f46a3262762.jpg"
            alt="Decoration"
            fill
            className="object-cover rounded-full"
            sizes="112px"
          />
        </div>

        {/* Overlay Image 3 */}
        <div
          ref={overlayImage3Ref}
          className="absolute top-1/2 right-20 w-16 h-16 md:w-24 md:h-24 opacity-50"
        >
          <Image
            src="https://i.pinimg.com/1200x/88/c1/0d/88c10d4fb189790cb4cf673c9f604665.jpg"
            alt="Decoration"
            fill
            className="object-cover rounded-full"
            sizes="96px"
          />
        </div>

        {/* Overlay Image 4 */}
        <div
          ref={overlayImage4Ref}
          className="absolute top-1/3 left-1/4 w-20 h-20 md:w-28 md:h-28 opacity-40"
        >
          <Image
            src="https://i.pinimg.com/736x/65/08/a4/6508a441441a0b3e31154882497e1993.jpg"
            alt="Decoration"
            fill
            className="object-cover rounded-full"
            sizes="112px"
          />
        </div>

        {/* Overlay Image 5 */}
        <div
          ref={overlayImage5Ref}
          className="absolute bottom-1/4 left-20 w-18 h-18 md:w-26 md:h-26 opacity-35"
        >
          <Image
            src="https://i.pinimg.com/1200x/7a/07/ae/7a07aef417a460bd23706a6cb6976bc7.jpg"
            alt="Decoration"
            fill
            className="object-cover rounded-full"
            sizes="104px"
          />
        </div>

        {/* Overlay Image 6 */}
        <div
          ref={overlayImage6Ref}
          className="absolute top-2/3 left-1/3 w-14 h-14 md:w-22 md:h-22 opacity-30"
        >
          <Image
            src="https://i.pinimg.com/736x/cb/ed/3d/cbed3d24b04afebcdac6db09b70601ad.jpg"
            alt="Decoration"
            fill
            className="object-cover rounded-full"
            sizes="88px"
          />
        </div>
      </div>
    
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <p
            ref={headerRef}
            className="text-xs text-white font-medium mb-2"
          >
            PHKASLA - ធៀបការឌីជីថល
          </p>

          {/* Main Title */}
          <h1
            ref={titleRef}
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 text-white leading-tight drop-shadow-lg"
          >
            ធៀបការបែបឌីជីថលក្នុងដៃអ្នក
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-xs md:text-sm text-white mb-5 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
          >
            កម្មវិធីគ្រប់គ្រងការរៀបចំពិធីមង្គលការដ៏ទំនើប ស្វែងរកភ្ញៀវ គ្រប់គ្រងចំណងដៃ បង្កើត លិខិតអញ្ជើញបែបឌីជីថល និងមានមុខងារពិសេសៗជាច្រើនទៀត។
          </p>

          {/* CTA Button */}
          <div ref={buttonsRef} className="mb-5">
            {isAuthenticated ? (
              <Button
                size="lg"
                className="bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg px-5 py-4 text-sm font-medium shadow-lg"
                asChild
              >
                <Link href={user?.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD}>
                  ទៅកាន់ផ្ទាំងគ្រប់គ្រង
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg px-5 py-4 text-sm font-medium shadow-lg"
                asChild
              >
                <Link href={ROUTES.REGISTER}>ចាប់ផ្តើមឥឡូវនេះ</Link>
              </Button>
            )}
          </div>

          {/* Statistics */}
          <div
            ref={statsRef}
            className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto"
          >
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold text-white mb-1 drop-shadow-md">
                ២០០០+
              </div>
              <div className="text-xs text-white">គូរស្នេហ៍</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold text-white mb-1 drop-shadow-md">
                ២៤/៧
              </div>
              <div className="text-xs text-white">ការគាំទ្រ</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold text-white mb-1 drop-shadow-md">
                ៩៩%
              </div>
              <div className="text-xs text-white">ការពេញចិត្ត</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
