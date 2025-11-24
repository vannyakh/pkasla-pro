import { User } from '@/types/user'

// Sample users for development/testing
// In production, these should be stored in a database
export const sampleUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@pkasla.com',
    name: 'Admin User',
    role: 'admin',
    password: 'admin123', // In production, this should be hashed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'admin',
    password: 'password123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'sarah.smith@example.com',
    name: 'Sarah Smith',
    role: 'user',
    password: 'password123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    email: 'demo@pkasla.com',
    name: 'Demo User',
    role: 'admin',
    password: 'demo123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Helper function to find user by email
export function findUserByEmail(email: string) {
  return sampleUsers.find(user => user.email.toLowerCase() === email.toLowerCase())
}

// Helper function to verify password (in production, use bcrypt)
export function verifyPassword(user: typeof sampleUsers[0], password: string): boolean {
  return user.password === password
}

// Helper function to get user without password
export function getUserWithoutPassword(user: typeof sampleUsers[0]): User {
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

