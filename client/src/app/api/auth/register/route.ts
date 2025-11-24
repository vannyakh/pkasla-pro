import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, sampleUsers } from '@/lib/sampleUsers'
import { User } from '@/types/user'

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // TODO: In production:
    // - Hash password using bcrypt
    // - Save to database
    // - Generate JWT token

    // Mock registration - create new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'user', // Default to user role
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production, save to database
    // For now, just return the user (it won't persist)
    
    return NextResponse.json({
      success: true,
      user: newUser,
      token: 'mock-jwt-token'
    }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

