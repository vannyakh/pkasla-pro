import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, verifyPassword, getUserWithoutPassword } from '@/lib/sampleUsers'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = findUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    if (!verifyPassword(user, password)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user without password
    const userWithoutPassword = getUserWithoutPassword(user)

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token'
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/me - Get current user
export async function GET(_request: NextRequest) {
  try {
    // TODO: Verify JWT token from cookies/headers
    // TODO: Fetch user from database
    
    // For now, return a default admin user
    // In production, extract user from JWT token
    const user = findUserByEmail('admin@pkasla.com')
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user: getUserWithoutPassword(user) })
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST /api/auth/register
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // TODO: Implement actual registration logic
    // - Validate input
    // - Check if user exists
    // - Hash password
    // - Create user in database
    // - Generate JWT token

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Mock registration
    const user = {
      id: Date.now().toString(),
      name,
      email,
      role: 'admin'
    }

    return NextResponse.json({
      success: true,
      user,
      token: 'mock-jwt-token'
    }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

