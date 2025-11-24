# MongoDB Setup Guide for Cloudflare Pages

This guide explains how to set up MongoDB with your Next.js application on Cloudflare Pages, including API routes and admin functionality.

## MongoDB Options

### 1. **MongoDB Atlas** (Recommended)
- Cloud-hosted MongoDB
- Free tier: 512MB storage
- Global clusters
- Works perfectly with serverless/Cloudflare Pages
- Best for: Production applications

### 2. **Self-Hosted MongoDB**
- Your own MongoDB server
- More control, but requires maintenance
- Best for: Enterprise/on-premise

**We'll use MongoDB Atlas as it's the easiest and most reliable for Cloudflare Pages.**

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new organization (or use default)

### 1.2 Create a Cluster

1. Click **"Build a Database"**
2. Choose **FREE (M0)** tier
3. Select a cloud provider and region (choose closest to your users)
4. Name your cluster (e.g., `pkasla-cluster`)
5. Click **"Create"** (takes 3-5 minutes)

### 1.3 Configure Database Access

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `pkasla-admin` (or your choice)
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **"Atlas admin"** (or custom)
7. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For Cloudflare Pages, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add specific Cloudflare IP ranges for better security
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@pkasla-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add database name at the end: `&appName=pkasla` or `?retryWrites=true&w=majority&appName=pkasla`

---

## Step 2: Install MongoDB Packages

```bash
bun add mongodb mongoose
bun add -d @types/mongodb
```

**Note**: We'll use both `mongodb` (native driver) and `mongoose` (ODM). Mongoose is easier for schemas, but native driver works better with serverless.

---

## Step 3: Create Database Connection

Create `src/lib/mongodb.ts`:

```typescript
// src/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}

// Use global variable to maintain connection across hot reloads in development
let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Helper function to get database
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(process.env.MONGODB_DB_NAME || 'pkasla')
}
```

---

## Step 4: Create Database Models/Schemas

### 4.1 User Model

Create `src/models/User.ts`:

```typescript
// src/models/User.ts
import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  id?: string
  email: string
  name: string
  passwordHash: string
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}

export const UserCollection = 'users'
```

### 4.2 Event Model

Create `src/models/Event.ts`:

```typescript
// src/models/Event.ts
import { ObjectId } from 'mongodb'

export interface Event {
  _id?: ObjectId
  id?: string
  userId: string
  title: string
  description?: string
  date: string
  venue?: string
  guestCount: number
  status: 'draft' | 'published' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export const EventCollection = 'events'
```

### 4.3 Guest Model

Create `src/models/Guest.ts`:

```typescript
// src/models/Guest.ts
import { ObjectId } from 'mongodb'

export interface Guest {
  _id?: ObjectId
  id?: string
  eventId: string
  name: string
  email?: string
  phone?: string
  status: 'pending' | 'confirmed' | 'declined'
  giftAmount?: number
  giftNote?: string
  createdAt: Date
  updatedAt: Date
}

export const GuestCollection = 'guests'
```

---

## Step 5: Create Database Helpers

Create `src/lib/db-helpers.ts`:

```typescript
// src/lib/db-helpers.ts
import { getDatabase } from './mongodb'
import { Db, ObjectId } from 'mongodb'

// User helpers
export async function findUserByEmail(email: string) {
  const db = await getDatabase()
  return db.collection('users').findOne({ email })
}

export async function findUserById(id: string) {
  const db = await getDatabase()
  return db.collection('users').findOne({ _id: new ObjectId(id) })
}

export async function createUser(userData: {
  email: string
  name: string
  passwordHash: string
  role?: 'admin' | 'user'
}) {
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection('users').insertOne({
    ...userData,
    role: userData.role || 'user',
    createdAt: now,
    updatedAt: now
  })
  return result.insertedId.toString()
}

// Event helpers
export async function getEvents(userId?: string) {
  const db = await getDatabase()
  const query = userId ? { userId } : {}
  return db.collection('events').find(query).sort({ createdAt: -1 }).toArray()
}

export async function getEventById(id: string) {
  const db = await getDatabase()
  return db.collection('events').findOne({ _id: new ObjectId(id) })
}

export async function createEvent(eventData: {
  userId: string
  title: string
  description?: string
  date: string
  venue?: string
  guestCount?: number
  status?: 'draft' | 'published' | 'cancelled'
}) {
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection('events').insertOne({
    ...eventData,
    guestCount: eventData.guestCount || 0,
    status: eventData.status || 'draft',
    createdAt: now,
    updatedAt: now
  })
  return result.insertedId.toString()
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const db = await getDatabase()
  const result = await db.collection('events').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  )
  return result.modifiedCount > 0
}

export async function deleteEvent(id: string) {
  const db = await getDatabase()
  const result = await db.collection('events').deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

// Guest helpers
export async function getGuests(eventId?: string) {
  const db = await getDatabase()
  const query = eventId ? { eventId } : {}
  return db.collection('guests').find(query).sort({ createdAt: -1 }).toArray()
}

export async function getGuestById(id: string) {
  const db = await getDatabase()
  return db.collection('guests').findOne({ _id: new ObjectId(id) })
}

export async function createGuest(guestData: {
  eventId: string
  name: string
  email?: string
  phone?: string
  status?: 'pending' | 'confirmed' | 'declined'
}) {
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection('guests').insertOne({
    ...guestData,
    status: guestData.status || 'pending',
    createdAt: now,
    updatedAt: now
  })
  return result.insertedId.toString()
}

export async function updateGuest(id: string, updates: Partial<Guest>) {
  const db = await getDatabase()
  const result = await db.collection('guests').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  )
  return result.modifiedCount > 0
}
```

---

## Step 6: Update API Routes

### 6.1 Update Auth Route (`src/app/api/auth/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/db-helpers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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

    // Find user in MongoDB
    const user = await findUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id?.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user without password
    const { passwordHash, _id, ...userWithoutPassword } = user
    const userResponse = {
      ...userWithoutPassword,
      id: _id?.toString()
    }

    const response = NextResponse.json({
      success: true,
      user: userResponse,
      token
    })

    // Set httpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string }
    
    // Fetch user from MongoDB
    const user = await findUserById(decoded.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { passwordHash, _id, ...userWithoutPassword } = user
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        id: _id?.toString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
```

### 6.2 Update Register Route (`src/app/api/auth/register/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, createUser } from '@/lib/db-helpers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user in MongoDB
    const userId = await createUser({
      email,
      name,
      passwordHash,
      role: 'user'
    })

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Fetch created user
    const user = await findUserById(userId)
    const { passwordHash: _, _id, ...userWithoutPassword } = user!

    const response = NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        id: _id?.toString()
      },
      token
    }, { status: 201 })

    // Set httpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 6.3 Update Events Route (`src/app/api/event/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getEvents, createEvent } from '@/lib/db-helpers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Helper to verify auth
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  if (!token) return null
  
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string }
  } catch {
    return null
  }
}

// GET /api/event - Get all events
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get events for the user (or all if admin)
    const events = await getEvents(user.role === 'admin' ? undefined : user.id)
    
    // Format response
    const formattedEvents = events.map(event => ({
      id: event._id?.toString(),
      ...event,
      _id: undefined
    }))

    return NextResponse.json({ events: formattedEvents })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/event - Create new event
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, venue, guestCount, status } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      )
    }

    const eventId = await createEvent({
      userId: user.id,
      title,
      description,
      date,
      venue,
      guestCount,
      status
    })

    return NextResponse.json({
      success: true,
      event: { id: eventId }
    }, { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Step 7: Environment Variables

### 7.1 Local Development (`.env.local`)

```env
MONGODB_URI=mongodb+srv://username:password@pkasla-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=pkasla
MONGODB_DB_NAME=pkasla
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 7.2 Cloudflare Pages

1. Go to **Pages** → Your project → **Settings** → **Environment variables**
2. Add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `MONGODB_DB_NAME`: `pkasla` (or your database name)
   - `JWT_SECRET`: Your secret key (use a strong random string)

---

## Step 8: Install Required Packages

```bash
bun add mongodb mongoose bcryptjs jsonwebtoken
bun add -d @types/bcryptjs @types/jsonwebtoken @types/mongodb
```

---

## Step 9: Create Initial Admin User Script

Create `scripts/create-admin.ts`:

```typescript
// scripts/create-admin.ts
import { getDatabase } from '../src/lib/mongodb'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const db = await getDatabase()
  const usersCollection = db.collection('users')

  // Check if admin exists
  const existingAdmin = await usersCollection.findOne({ email: 'admin@pkasla.com' })
  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10)
  const now = new Date()

  await usersCollection.insertOne({
    email: 'admin@pkasla.com',
    name: 'Admin User',
    passwordHash,
    role: 'admin',
    createdAt: now,
    updatedAt: now
  })

  console.log('Admin user created successfully!')
  console.log('Email: admin@pkasla.com')
  console.log('Password: admin123')
  console.log('⚠️  Please change the password after first login!')
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

Add to `package.json`:

```json
{
  "scripts": {
    "create-admin": "tsx scripts/create-admin.ts"
  }
}
```

Run: `bun run create-admin`

---

## Step 10: Update useAuth Hook

Update `src/hooks/useAuth.ts` to use API routes (same as before, but now with MongoDB backend).

---

## Important Notes

1. **Connection Pooling**: MongoDB connection is reused across requests in serverless environments
2. **Error Handling**: Always handle MongoDB connection errors gracefully
3. **Indexes**: Create indexes for frequently queried fields:
   ```typescript
   // In a migration script
   await db.collection('users').createIndex({ email: 1 }, { unique: true })
   await db.collection('events').createIndex({ userId: 1 })
   await db.collection('guests').createIndex({ eventId: 1 })
   ```
4. **Security**: 
   - Never commit `.env` files
   - Use strong passwords for MongoDB Atlas
   - Restrict network access when possible
   - Use environment variables for all secrets

---

## Next Steps

1. ✅ Set up MongoDB Atlas account
2. ✅ Create cluster and get connection string
3. ✅ Install packages
4. ✅ Create database connection
5. ✅ Create models and helpers
6. ✅ Update API routes
7. ✅ Set environment variables
8. ✅ Create admin user
9. ✅ Test locally
10. ✅ Deploy to Cloudflare Pages

For more information:
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
- [Next.js with MongoDB](https://nextjs.org/docs/app/building-your-application/data-fetching)

