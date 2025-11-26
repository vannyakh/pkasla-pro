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
    name?: string;
    role: UserRole;
    status: string;
    phone?: string;
    avatar?: string;
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
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
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
            name: user.name,
            role: user.role,
            status: user.status,
            phone: user.phone,
            avatar: user.avatar,
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
    async signIn({ user, account }) {
      // Handle OAuth sign-in - link with backend API
      if (account && account.provider !== 'credentials' && user.email) {
  
        // Ensure provider name matches backend expectations (lowercase)
        const normalizedProvider = account.provider.toLowerCase();

        const requestPayload = {
          email: user.email,
          name: user.name || user.email.split('@')[0], // Fallback to email prefix if no name
          provider: normalizedProvider,
          providerId: account.providerAccountId || account.id_token || user.id, // Fallback if providerAccountId missing
          accessToken: account.access_token || account.id_token || 'oauth-token', // Fallback if access_token missing
          avatar: user.image,
        };

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login/oauth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
          });
          // Read response as text first to see raw response
          const responseText = await response.text();

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('[NextAuth] ❌ Failed to parse response as JSON:', parseError);
            console.error('[NextAuth] ❌ Raw response:', responseText);
            throw new Error(`Invalid JSON response from backend: ${responseText.substring(0, 200)}`);
          }
          
          console.log('[NextAuth] 📦 Backend response data:', {
            success: data.success,
            hasData: !!data.data,
            error: data.error,
            message: data.message,
            fullData: data,
          });

          if (response.ok && data.success) {
            const authData = data.data;
            const apiUser = authData.user;
            const tokens = authData.tokens;


            // Update user object with API response
            user.id = apiUser.id;
            user.role = apiUser.role;
            user.status = apiUser.status;
            user.avatar = apiUser.avatar || user.image;
            user.createdAt = apiUser.createdAt;
            user.updatedAt = apiUser.updatedAt;
            (user as User & { accessToken?: string; refreshToken?: string }).accessToken = tokens.accessToken;
            (user as User & { accessToken?: string; refreshToken?: string }).refreshToken = tokens.refreshToken;
            console.log('[NextAuth] ✅ Allowing sign-in');
            return true;
          } else {
            // OAuth API call failed - log error and prevent sign-in
            // Log validation errors if present
            if (data.errors) {
              console.error('[NextAuth] ❌ Validation errors:', data.errors);
            }
            
            return false; // Prevent sign-in if backend API fails
          }
        } catch (error) {
          // Network or other error - prevent sign-in
          console.error('[NextAuth] ❌ OAuth network/request error:', error);
          return false; // Prevent sign-in on error
        }
      }
      
      // For credentials provider, always allow
      if (account?.provider === 'credentials') {
        console.log('[NextAuth] ✅ Credentials provider - allowing sign-in');
      }
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

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

