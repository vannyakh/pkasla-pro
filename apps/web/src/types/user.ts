export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  avatar?: string;
  phone?: string;
  email: string;
  name: string;
  role: UserRole;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

