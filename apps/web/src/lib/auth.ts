import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import LinkedIn from 'next-auth/providers/linkedin';
import type { User, UserRole } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: User & DefaultSession['user'];
    accessToken?: string;
    refreshToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date | string;
    updatedAt: Date | string;
    accessToken?: string;
    refreshToken?: string;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        emailOrPhone: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Map emailOrPhone to email for backend API
          const email = credentials.emailOrPhone;
          
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            // Provide more specific error message
            const errorMessage = data.message || data.error || 'Invalid email or password';
            throw new Error(errorMessage);
          }

          const authData = data.data;
          
          // Handle 2FA requirement
          if (authData.requiresTwoFactor) {
            throw new Error('Two-factor authentication is required. Please use the API directly.');
          }

          const user = authData.user;
          const tokens = authData.tokens;

          if (!user || !tokens) {
            throw new Error('Invalid response from authentication server');
          }

          // Return user with tokens
          return {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
        } catch (error) {
          console.error('Auth error:', error);
          // Re-throw to provide error message to NextAuth
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Authentication failed');
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn() {
      // For invitation system, only allow credentials-based sign-in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle OAuth callback redirects
      // If url is relative, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to baseUrl
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user as unknown as User;
        const userWithTokens = user as User & { accessToken?: string; refreshToken?: string };
        token.accessToken = userWithTokens.accessToken;
        token.refreshToken = userWithTokens.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        const user = token.user as User;
        session.user = {
          ...user,
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: null,
        } as User & DefaultSession['user'] & { emailVerified: null };
        session.accessToken = token.accessToken as string | undefined;
        session.refreshToken = token.refreshToken as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);


