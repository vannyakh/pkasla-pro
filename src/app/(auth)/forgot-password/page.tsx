'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (emailError) {
      validateEmail(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validate email
    const isEmailValid = validateEmail(email)
    
    if (!isEmailValid) {
      return
    }

    setLoading(true)
    setIsSubmitting(true)
    
    try {
      // TODO: Replace with API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })
      // const result = await response.json()

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, always succeed
      setIsSuccess(true)
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('An error occurred. Please try again later.')
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
                Reset Your Password
              </h1>
              <p className="text-sm text-white/90 leading-relaxed drop-shadow-md">
                No worries! Enter your email address and we&apos;ll send you instructions to reset your password.
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 backdrop-blur-md rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all">
                <p className="font-semibold text-white mb-1.5 drop-shadow-md">Secure Process</p>
                <p className="text-white/90 text-[11px] drop-shadow-sm">Your data is protected</p>
              </div>
              <div className="p-4 backdrop-blur-md rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all">
                <p className="font-semibold text-white mb-1.5 drop-shadow-md">Quick Recovery</p>
                <p className="text-white/90 text-[11px] drop-shadow-sm">Get back in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
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
            <CardTitle className="text-2xl font-bold text-center text-black">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-sm text-center text-gray-500">
              {isSuccess 
                ? 'Check your email for reset instructions' 
                : 'Enter your email address and we\'ll send you a reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {isSuccess ? (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="text-center space-y-4 py-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Email Sent!</h3>
                    <p className="text-sm text-gray-600">
                      We&apos;ve sent password reset instructions to <br />
                      <span className="font-medium text-gray-900">{email}</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                </div>

                {/* Back to Login */}
                <div className="space-y-4">
                  <Button
                    asChild
                    className="w-full h-11 text-sm font-medium bg-black hover:bg-gray-900 transition-all shadow-md hover:shadow-lg"
                  >
                    <Link href="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Link>
                  </Button>
                  
                  <div className="text-center text-xs text-gray-500">
                    Didn&apos;t receive the email?{' '}
                    <button
                      onClick={() => {
                        setIsSuccess(false)
                        setEmail('')
                        setError(null)
                      }}
                      className="text-black hover:underline font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            ) : (
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
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}

            {/* Back to Login Link */}
            {!isSuccess && (
              <div className="mt-6 text-center">
                <Link 
                  href="/login" 
                  className="text-sm text-gray-600 hover:text-black hover:underline transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

