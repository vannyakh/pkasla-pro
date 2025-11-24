import { NextRequest, NextResponse } from 'next/server'

// GET /api/guest - Get all guests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    // TODO: Fetch guests from database
    // TODO: Filter by eventId if provided

    const guests = [
      {
        id: '1',
        name: 'Guest Name 1',
        email: 'guest1@example.com',
        phone: '+855 12 345 678',
        eventId: '1',
        status: 'confirmed'
      }
    ]

    return NextResponse.json({ guests })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/guest - Create new guest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validate request body
    // TODO: Create guest in database

    const guest = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ guest }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

