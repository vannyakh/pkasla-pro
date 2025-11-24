// Authentication utilities

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

// TODO: Add JWT token validation
export function validateToken(token: string): boolean {
  // Implement token validation logic
  return true
}

