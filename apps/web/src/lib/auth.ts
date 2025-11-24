import NextAuth, { type DefaultSession, type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
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

export const authConfig: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        emailOrPhone: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailOrPhone: credentials.emailOrPhone,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            return null;
          }

          const authData = data.data;
          const user = authData.user;
          const tokens = authData.tokens;

          if (!user || !tokens) {
            return null;
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
          return null;
        }
      },
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
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authConfig);

