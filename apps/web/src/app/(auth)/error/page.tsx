'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.';
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account in the database.';
      case 'EmailCreateAccount':
        return 'Could not create email account in the database.';
      case 'Callback':
        return 'Error in the OAuth callback handler route.';
      case 'OAuthAccountNotLinked':
        return 'To confirm your identity, sign in with the same account you used originally.';
      case 'EmailSignin':
        return 'The e-mail could not be sent.';
      case 'CredentialsSignin':
        return 'Invalid email/phone or password.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return errorCode || 'An error occurred during authentication.';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-2">
                Authentication Error
              </h1>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {getErrorMessage(error)}
              </p>
              <Link
                href={ROUTES.LOGIN}
                className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

