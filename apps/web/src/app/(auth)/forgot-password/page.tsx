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
  )
}

