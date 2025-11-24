import { NextRequest, NextResponse } from 'next/server'

// GET /api/event - Get all events
export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch events from database
    // TODO: Add pagination, filtering, sorting

    const events = [
      {
        id: '1',
        title: 'Wedding Event 1',
        date: '2024-12-20',
        venue: 'Grand Ballroom, Phnom Penh',
        guestCount: 120,
        status: 'published'
      }
    ]

    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/event - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validate request body
    // TODO: Create event in database

    const event = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

