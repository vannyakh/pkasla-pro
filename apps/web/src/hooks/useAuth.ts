'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LoginDto, RegisterDto } from '@/types/user'
import { findUserByEmail, verifyPassword, getUserWithoutPassword, sampleUsers } from '@/lib/sampleUsers'

const AUTH_STORAGE_KEY = 'pkasla_auth_user'


export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid data
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginDto) => {
    try {
      console.log('useAuth.login called with:', { email: credentials.email })
      
      // TODO: Replace with API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // })
      // const data = await response.json()

      // Find user by email (client-side for now)
      const user = findUserByEmail(credentials.email)
      console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found')
      
      if (!user) {
        console.log('User not found for email:', credentials.email)
        return { success: false, error: 'Invalid email or password' }
      }

      // Verify password (client-side for now)
      const passwordValid = verifyPassword(user, credentials.password)
      console.log('Password valid:', passwordValid)
      if (!passwordValid) {
        console.log('Password verification failed')
        return { success: false, error: 'Invalid email or password' }
      }

      // Get user without password
      const userWithoutPassword = getUserWithoutPassword(user)
      console.log('User without password:', userWithoutPassword)

      // Store user in localStorage (TODO: Replace with JWT token in httpOnly cookie)
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword))
        console.log('User stored in localStorage')
      }

      setUser(userWithoutPassword)
      
      // Redirect based on role
      const redirectPath = userWithoutPassword.role === 'admin' ? '/admin' : '/dashbord'
      console.log('Redirecting to:', redirectPath)
      
      // Use window.location.href for a full page reload to ensure all components
      // pick up the new auth state from localStorage
      window.location.href = redirectPath
      
      return { success: true }
    } catch (error) {
      console.error('Login error in useAuth:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  const register = async (data: RegisterDto) => {
    try {
      // TODO: Replace with API call
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      // const result = await response.json()

      // Check if user already exists (client-side for now)
      if (findUserByEmail(data.email)) {
        return { success: false, error: 'User with this email already exists' }
      }

      // Create new user (client-side for now)
      // TODO: Save to database via API
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: 'user', // Default to user role (not admin)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Store in localStorage (TODO: Replace with JWT token in httpOnly cookie)
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      }

      setUser(newUser)
      // New users go to dashboard (not admin panel)
      router.push('/dashbord')
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
    router.push('/login')
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }
}
