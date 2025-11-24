'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const { login } = useAuth()

  // Auto-focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError(null)
    return true
  }

  // Password validation
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required')
      return false
    }
    if (value.length < 3) {
      setPasswordError('Password must be at least 3 characters')
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (emailError) {
      validateEmail(value)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (passwordError) {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validate fields
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setLoading(true)
    setIsSubmitting(true)
    
    try {
      const result = await login({ email, password })
      if (!result.success) {
        setError(result.error || 'Login failed')
        setIsSubmitting(false)
      }
      // Login hook redirects: admin -> /admin, user -> /dashbord
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login')
      setIsSubmitting(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop')`
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="flex flex-col items-center justify-center w-full p-12 relative z-10">
          <div className="max-w-md text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
                Wedding Invitation Platform
              </h1>
              <p className="text-sm text-white/90 leading-relaxed drop-shadow-md">
                Create beautiful Cambodian wedding invitations and manage your events with ease
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 backdrop-blur-md rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all">
                <p className="font-semibold text-white mb-1.5 drop-shadow-md">Event Management</p>
                <p className="text-white/90 text-[11px] drop-shadow-sm">Organize your wedding events</p>
              </div>
              <div className="p-4 backdrop-blur-md rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all">
                <p className="font-semibold text-white mb-1.5 drop-shadow-md">Guest Tracking</p>
                <p className="text-white/90 text-[11px] drop-shadow-sm">Manage your guest list</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-8 lg:bg-white relative overflow-hidden">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <Card className="max-w-md w-full p-0 shadow-none bg-transparent relative z-10">
          <CardHeader className="pb-6 pt-8 px-8 space-y-2">
            <CardTitle className="text-2xl font-bold text-center text-black">Welcome Back</CardTitle>
            <CardDescription className="text-sm text-center text-gray-500">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  placeholder="email@example.com"
                  className={cn(
                    "h-11 text-sm border-gray-300 pl-10 pr-4 focus:border-black focus:ring-1 focus:ring-black transition-all",
                    emailError && "border-red-400 focus:border-red-400 focus:ring-red-400"
                  )}
                  required
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
              </div>
              {emailError && (
                <p id="email-error" className="text-xs text-red-600 mt-1">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-gray-600 hover:text-black hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => validatePassword(password)}
                  placeholder="Enter your password"
                  className={cn(
                    "h-11 text-sm border-gray-300 pl-10 pr-11 focus:border-black focus:ring-1 focus:ring-black transition-all",
                    passwordError && "border-red-400 focus:border-red-400 focus:ring-red-400"
                  )}
                  required
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="text-xs text-red-600 mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="border-gray-300"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-gray-600 cursor-pointer font-normal"
              >
                Remember me
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in-0"
                role="alert"
              >
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full h-11 text-sm font-medium bg-black hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
            <Link 
              href="/register" 
              className="text-sm text-black hover:underline font-semibold transition-colors"
            >
              Create account
            </Link>
          </div>

          {/* Test Accounts (Collapsible) */}
          <details className="mt-6 pt-6 border-t border-gray-200">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 list-none transition-colors">
              <span className="select-none">Test Accounts</span>
            </summary>
            <div className="mt-4 text-xs text-gray-600 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800 mb-2">Admin Accounts:</p>
                <p className="font-mono text-[11px] text-gray-700">admin@pkasla.com / admin123</p>
                <p className="font-mono text-[11px] text-gray-700 mt-1">demo@pkasla.com / demo123</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800 mb-2">User Account:</p>
                <p className="font-mono text-[11px] text-gray-700">sarah.smith@example.com / password123</p>
              </div>
            </div>
          </details>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
