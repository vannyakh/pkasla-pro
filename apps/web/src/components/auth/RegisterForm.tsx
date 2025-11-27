'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import type { RegisterDto, User } from '@/types';
import { useRegister } from '@/hooks/api/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function RegisterForm() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const registerMutation = useRegister();
  const [formData, setFormData] = useState<RegisterDto & { confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validateName = useCallback((value: string): boolean => {
    if (!value.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះរបស់អ្នក');
      return false;
    }
    if (value.trim().length < 2) {
      toast.error('ឈ្មោះត្រូវមានយ៉ាងហោចណាស់ 2 តួអក្សរ');
      return false;
    }
    return true;
  }, []);

  const validateEmail = useCallback((value: string): boolean => {
    if (!value.trim()) {
      toast.error('សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      toast.error('សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែល');
      return false;
    }
    return true;
  }, []);

  const validatePassword = useCallback((value: string): boolean => {
    if (!value) {
      toast.error('សូមបញ្ចូលពាក្យសម្ងាត់របស់អ្នក');
      return false;
    }
    if (value.length < 6) {
      toast.error('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ');
      return false;
    }
    return true;
  }, []);

  const validateConfirmPassword = useCallback((value: string, password: string): boolean => {
    if (!value) {
      toast.error('សូមបញ្ចូលការបញ្ជាក់ពាក្យសម្ងាត់');
      return false;
    }
    if (value !== password) {
      toast.error('ពាក្យសម្ងាត់មិនត្រូវគ្នា');
      return false;
    }
    return true;
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, confirmPassword: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim form data
    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    // Validate form - stop at first error to avoid duplicate toasts
    const isNameValid = validateName(trimmedData.name);
    if (!isNameValid) {
      return;
    }

    const isEmailValid = validateEmail(trimmedData.email);
    if (!isEmailValid) {
      return;
    }

    const isPasswordValid = validatePassword(trimmedData.password);
    if (!isPasswordValid) {
      return;
    }

    const isConfirmPasswordValid = validateConfirmPassword(trimmedData.confirmPassword, trimmedData.password);
    if (!isConfirmPasswordValid) {
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: trimmedData.name,
        email: trimmedData.email,
        password: trimmedData.password,
      });

      // Update session to get latest user data
      await updateSession();

      // Get user role for redirect
      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        const user = sessionData?.user as User | undefined;

        toast.success('ការចុះឈ្មោះជោគជ័យ! សូមស្វាគមន៍!');

        // Redirect based on user role
        const redirectPath = user?.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD;
        router.push(redirectPath);
        router.refresh();
      } catch {
        // Fallback redirect
        toast.success('ការចុះឈ្មោះជោគជ័យ! សូមស្វាគមន៍!');
        router.push(ROUTES.HOME);
        router.refresh();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ការចុះឈ្មោះមិនជោគជ័យ!';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[450px] mx-auto">
      <Card className="p-0 shadow-none bg-transparent border-0">
        <CardContent className="relative p-0 m-0 sm:p-4 md:p-10 lg:p-12">
          {/* Header Frame */}
          <div 
            className="absolute -top-12 flex items-center justify-center left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] h-44 md:h-64 bg-[url('/images/assets/frame-image-title.png')] bg-no-repeat bg-cover bg-center z-10"
            style={{
              backgroundSize: '100% 100%',
            }}
          >
            <h1 className="text-red-800 md:text-3xl text-2xl -translate-y-1 font-moulpali font-bold">ចុះឈ្មោះ</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pt-8 sm:pt-10 md:pt-12" noValidate autoComplete="on">
            {/* Name Field */}
            <div className="space-y-2">
              <div className="relative">
                <div 
                  className="relative bg-[url('/images/assets/input-frame.png')] bg-no-repeat bg-cover bg-center h-10 sm:h-11 rounded-md"
                  style={{
                    backgroundSize: '100% 100%',
                  }}
                >
                  <input
                    ref={nameInputRef}
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="ឈ្មោះពេញរបស់អ្នក"
                    autoComplete="name"
                    className="w-full h-full bg-transparent border-0 outline-none text-sm pl-10 sm:pl-12 pr-4 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <div className="relative">
                <div 
                  className="relative bg-[url('/images/assets/input-frame.png')] bg-no-repeat bg-cover bg-center h-10 sm:h-11 rounded-md"
                  style={{
                    backgroundSize: '100% 100%',
                  }}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    placeholder="អ៊ីមែលរបស់អ្នក"
                    autoComplete="email"
                    className="w-full h-full bg-transparent border-0 outline-none text-sm pl-10 sm:pl-12 pr-4 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <div 
                  className="relative bg-[url('/images/assets/input-frame.png')] bg-no-repeat bg-cover bg-center h-10 sm:h-11 rounded-md"
                  style={{
                    backgroundSize: '100% 100%',
                  }}
                >
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់របស់អ្នក"
                    autoComplete="new-password"
                    className="w-full h-full bg-transparent ring-0 border-0 outline-none text-sm pl-10 sm:pl-12 pr-11 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 sm:right-6 cursor-pointer top-1/2 transform -translate-y-1/2 text-white hover:text-gray-700 focus:outline-none transition-colors z-10"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white" />
                    ) : (
                      <Eye className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <div 
                  className="relative bg-[url('/images/assets/input-frame.png')] bg-no-repeat bg-cover bg-center h-10 sm:h-11 rounded-md"
                  style={{
                    backgroundSize: '100% 100%',
                  }}
                >
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="បញ្ជាក់ពាក្យសម្ងាត់របស់អ្នក"
                    autoComplete="new-password"
                    className="w-full h-full bg-transparent ring-0 border-0 outline-none text-sm pl-10 sm:pl-12 pr-11 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 sm:right-6 cursor-pointer top-1/2 transform -translate-y-1/2 text-white hover:text-gray-700 focus:outline-none transition-colors z-10"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-white" />
                    ) : (
                      <Eye className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-10 sm:h-11 text-sm font-medium hover:bg-transparent cursor-pointer shadow-none bg-transparent bg-[url('/images/assets/input-frame.png')] bg-no-repeat bg-cover bg-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                backgroundSize: '100% 100%',
              }}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  កំពុងបង្កើតគណនី...
                </>
              ) : (
                'បង្កើតគណនី'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-3 sm:mt-4 md:mt-6 text-center">
            <span className="text-xs sm:text-sm text-gray-600">
              មានគណនីរួចហើយ?{' '}
            </span>
            <Link
              href="/login"
              className="text-xs sm:text-sm text-black hover:underline font-semibold transition-colors"
            >
              ចូល
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
