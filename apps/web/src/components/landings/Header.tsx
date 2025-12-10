'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import ProfileMenu from '@/components/layout/ProfileMenu'
import type { User } from '@/types'

export function Header() {
  const { data: session, status } = useSession()
  const user = session?.user as User | undefined
  const isAuthenticated = !!user

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
              width={220}
              height={220}
              className="h-12 md:h-16 w-auto"
              priority
            />
          </a>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {status === 'loading' ? (
              // Loading state
              <div className="h-8 w-8 rounded-full bg-white/20 animate-pulse" />
            ) : isAuthenticated ? (
              // Authenticated user - show dashboard link and profile menu
              <>
                <Button
                  variant="outline"
                  className="bg-transparent backdrop-blur-xl border-red-500 text-white hover:bg-red-500 hover:text-white rounded-lg px-4 py-2"
                  asChild
                >
                  <Link href={user?.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD}>
                    {user?.role === 'admin' ? 'ផ្ទាំងគ្រប់គ្រង' : 'ផ្ទាំងគ្រប់គ្រង'}
                  </Link>
                </Button>
                <ProfileMenu className="bg-white/10 hover:bg-white/20 rounded-full" />
              </>
            ) : (
              // Not authenticated - show login and register buttons
              <>
                <Button
                  variant="outline"
                  className="bg-transparent backdrop-blur-xl border-red-500 text-white hover:bg-red-500 hover:text-white rounded-lg px-4 py-2"
                  asChild
                >
                  <Link href={ROUTES.LOGIN}>ចូលប្រើ</Link>
                </Button>

                <Button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
                  asChild
                >
                  <Link href={ROUTES.REGISTER}>សមាជិក</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
