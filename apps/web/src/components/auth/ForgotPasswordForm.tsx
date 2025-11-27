'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const isEmailValid = validateEmail(trimmedEmail);
    
    if (!isEmailValid) {
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: trimmedEmail })
      // })
      // const result = await response.json()

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      toast.success('សូមពិនិត្យអ៊ីមែលរបស់អ្នកសម្រាប់តំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញ');
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error('មានកំហុសកើតឡើង។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
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
              <h1 className="text-red-800 md:text-3xl text-2xl -translate-y-1 font-moulpali font-bold">ភ្ជាប់ពាក្យសម្ងាត់</h1>
            </div>
            <div className="pt-8 sm:pt-10 md:pt-12 space-y-4 sm:space-y-5 text-center">
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-gray-700">
                  យើងបានផ្ញើតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញទៅកាន់អ៊ីមែលរបស់អ្នក។
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  សូមពិនិត្យប្រអប់ទទួលអ៊ីមែលរបស់អ្នក។
                </p>
              </div>
              <Link
                href={ROUTES.LOGIN}
                className="inline-block text-sm text-black hover:underline font-semibold transition-colors"
              >
                ត្រលប់ទៅកាន់ទំព័រចូល
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-red-800 md:text-3xl text-2xl -translate-y-1 font-moulpali font-bold">ភ្ជាប់ពាក្យសម្ងាត់</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pt-8 sm:pt-10 md:pt-12" noValidate autoComplete="on">
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
                    ref={emailInputRef}
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="អ៊ីមែលរបស់អ្នក"
                    autoComplete="email"
                    className="w-full h-full bg-transparent border-0 outline-none text-sm pl-10 sm:pl-12 pr-4 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 sm:h-11 text-sm font-medium hover:bg-transparent cursor-pointer shadow-none bg-transparent bg-[url('/images/assets/input-frame.png')] bg-no-repeat bg-cover bg-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                backgroundSize: '100% 100%',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  កំពុងផ្ញើ...
                </>
              ) : (
                'ផ្ញើតំណភ្ជាប់'
              )}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-3 sm:mt-4 md:mt-6 text-center">
            <Link
              href={ROUTES.LOGIN}
              className="text-xs sm:text-sm text-black hover:underline font-semibold transition-colors"
            >
              ← ត្រលប់ទៅកាន់ទំព័រចូល
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

