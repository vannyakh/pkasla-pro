'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [googleEmail, setGoogleEmail] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for OAuth errors
      if (error) {
        setStatus('error');
        setErrorMessage(
          error === 'access_denied'
            ? 'You cancelled the authorization. Please try again.'
            : `Authorization failed: ${error}`
        );
        return;
      }

      // Check for required parameters
      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Missing authorization code or state. Please try again.');
        return;
      }

      try {
        // Call backend to exchange code for tokens
        const response = await api.get<{
          connected: boolean;
          googleEmail?: string;
          googleName?: string;
        }>(`/guests/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);

        if (!response.success) {
          throw new Error(response.error || 'Failed to connect Google account');
        }

        // Success!
        setStatus('success');
        setGoogleEmail(response.data?.googleEmail || '');
        // Redirect to previous page or guests page after 2 seconds
        setTimeout(() => {
          const returnTo = localStorage.getItem('google_oauth_return_to') || '/dashboard';
          localStorage.removeItem('google_oauth_return_to');
          router.push(returnTo);
        }, 2000);
      } catch (error: any) {
        console.error('Error connecting Google account:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to connect Google account. Please try again.');
        toast.error(error.message || 'Failed to connect Google account');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Connecting Google Account...'}
            {status === 'success' && 'Successfully Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we connect your Google account'}
            {status === 'success' && 'Your Google account has been connected'}
            {status === 'error' && 'There was a problem connecting your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-blue-100 dark:border-blue-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Authenticating with Google...
                </p>
                <div className="flex justify-center gap-1">
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" />
                </div>
              </div>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="font-semibold text-green-600 dark:text-green-400">
                  Connection Successful!
                </p>
                {googleEmail && (
                  <p className="text-sm text-muted-foreground">
                    Connected as <strong>{googleEmail}</strong>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Redirecting you back...
                </p>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    Connection Failed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {errorMessage}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="default"
                    onClick={() => router.back()}
                    className="min-w-[140px]"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="min-w-[140px]"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

