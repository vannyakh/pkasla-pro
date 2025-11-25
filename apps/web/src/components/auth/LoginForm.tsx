'use client';

import { useState, useRef, useEffect, useLayoutEffect, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import type { LoginDto } from '@/types';
import { useLogin } from '@/hooks/api/useAuth';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();

  // Initialize form data - same on server and client to avoid hydration mismatch
  const [formData, setFormData] = useState<LoginDto & { rememberMe: boolean }>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const hasLoadedRef = useRef(false);

  useLayoutEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      startTransition(() => {
        setFormData({
          email: rememberedEmail,
          password: '',
          rememberMe: true,
        });
      });
    }
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 3) {
      setPasswordError('Password must be at least 3 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (emailError) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    if (passwordError) {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/';

      // Sign in with NextAuth first (required for middleware and ProtectedRoute)
      const nextAuthResult = await signIn('credentials', {
        emailOrPhone: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!nextAuthResult?.ok) {
        // Map NextAuth error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          CredentialsSignin: 'Invalid email or password. Please check your credentials and try again.',
          Configuration: 'There is a problem with the server configuration.',
          AccessDenied: 'Access denied. Please contact support.',
          Verification: 'The verification token has expired or has already been used.',
        };
        
        const errorMessage = errorMessages[nextAuthResult.error || ''] || 
          nextAuthResult.error || 
          'Invalid email or password';
        throw new Error(errorMessage);
      }
      try {
        await loginMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        });
      } catch (zustandError) {
        console.warn('Failed to update Zustand store:', zustandError);
      }

      // Handle remember me
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success('Login successful!');
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Card className="p-0 shadow-none bg-transparent">
      <CardHeader className="pb-6 pt-8 px-8 space-y-2">
        <CardTitle className="text-2xl font-bold text-center text-black">Welcome Back</CardTitle>
        <CardDescription className="text-sm text-center text-gray-500">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={emailInputRef}
                id="email"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                onBlur={() => validateEmail(formData.email)}
                placeholder="email@example.com"
                className={cn(
                  'h-11 text-sm border-gray-300 pl-10 pr-4 focus:border-black focus:ring-1 focus:ring-black transition-all',
                  emailError && 'border-red-400 focus:border-red-400 focus:ring-red-400'
                )}
                required
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
            </div>
            {emailError && (
              <p id="email-error" className="text-xs text-red-600 mt-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-xs text-gray-600 hover:text-black hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handlePasswordChange}
                onBlur={() => validatePassword(formData.password)}
                placeholder="Enter your password"
                className={cn(
                  'h-11 text-sm border-gray-300 pl-10 pr-11 focus:border-black focus:ring-1 focus:ring-black transition-all',
                  passwordError && 'border-red-400 focus:border-red-400 focus:ring-red-400'
                )}
                required
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <p id="password-error" className="text-xs text-red-600 mt-1">
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked === true })}
              className="border-gray-300"
              suppressHydrationWarning
            />
            <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer font-normal">
              Remember me
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-11 text-sm font-medium bg-black hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
          <Link href="/register" className="text-sm text-black hover:underline font-semibold transition-colors">
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

