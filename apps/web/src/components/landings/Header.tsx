'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'

export function Header() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center cursor-pointer"
          >
            <Image
              src="/logo.png"
              alt="phkasla logo"
              width={120}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </a>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Login Button */}
            <Button
              variant="outline"
              className="bg-transparent backdrop-blur-xl border-red-500 text-white hover:bg-red-500 hover:text-white rounded-lg px-4 py-2"
              asChild
            >
              <Link href={ROUTES.LOGIN}>ចូលប្រើ</Link>
            </Button>

            {/* Signup Button */}
            <Button
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
              asChild
            >
              <Link href={ROUTES.REGISTER}>សមាជិក</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
