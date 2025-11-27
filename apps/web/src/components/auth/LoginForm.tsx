"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants";
import type { LoginDto, User } from "@/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye, Loader2 } from "lucide-react";
import { Github, Linkedin } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();

  // Initialize form data with remembered email if available
  const getInitialFormData = (): LoginDto & { rememberMe: boolean } => {
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem("rememberedEmail");
      if (rememberedEmail) {
        return {
          email: rememberedEmail,
          password: "",
          rememberMe: true,
        };
      }
    }
    return {
      email: "",
      password: "",
      rememberMe: false,
    };
  };

  const [formData, setFormData] = useState<LoginDto & { rememberMe: boolean }>(
    getInitialFormData
  );
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Handle OAuth callback success
  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const provider = searchParams.get("provider");

    if (oauthSuccess === "true" && provider) {
      toast.success(`Successfully signed in with ${provider}!`);
      // Clean up URL
      router.replace("/login");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim email
    const trimmedEmail = formData.email.trim();

    // Validate form - stop at first error to avoid duplicate toasts
    const isEmailValid = validateEmail(trimmedEmail);
    if (!isEmailValid) {
      return;
    }

    const isPasswordValid = validatePassword(formData.password);
    if (!isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      const result = await signIn("credentials", {
        email: trimmedEmail,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Handle remember me
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", trimmedEmail);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        toast.success("ចុូលប្រព័ន្ធជោគជ័យ!");

        // Update session to get latest user data
        await updateSession();

        // Get user role for redirect
        try {
          const sessionResponse = await fetch("/api/auth/session");
          const sessionData = await sessionResponse.json();
          const user = sessionData?.user as User | undefined;

          // Determine redirect path
          let redirectPath = callbackUrl;
          
          // If callbackUrl is home or root, redirect based on role
          if (callbackUrl === "/" || callbackUrl === ROUTES.HOME) {
            redirectPath = user?.role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD;
          }

          router.push(redirectPath);
          router.refresh();
        } catch {
          // Fallback: redirect to home, middleware will handle role-based redirect
          router.push(callbackUrl);
          router.refresh();
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ចុូលប្រព័ន្ធមិនជោគជ័យ!");
      setIsLoading(false);
    }
  };

  const validateEmail = useCallback((email: string): boolean => {
    if (!email.trim()) {
      toast.error("សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែល");
      return false;
    }
    return true;
  }, []);

  const validatePassword = useCallback((password: string): boolean => {
    if (!password) {
      toast.error("សូមបញ្ចូលពាក្យសម្ងាត់របស់អ្នក");
      return false;
    }
    if (password.length < 6) {
      toast.error("ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ");
      return false;
    }
    return true;
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
  };

  const handleOAuthSignIn = useCallback(
    (provider: "google" | "github" | "linkedin") => {
      setOauthLoading(provider);
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      signIn(provider, {
        callbackUrl: callbackUrl,
        redirect: true,
      });
    },
    [searchParams]
  );

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
              <h1 className="text-red-800 md:text-3xl text-2xl -translate-y-1  font-moulpali font-bold">ចុូលប្រព័ន្ធ</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pt-8 sm:pt-10 md:pt-12" noValidate>
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
                      type="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      placeholder="អ៊ីមែលរបស់អ្នក"
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
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handlePasswordChange}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់របស់អ្នក"
                      className="w-full h-full bg-transparent ring-0 border-0 outline-none text-sm pl-10 sm:pl-12 pr-11 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 sm:right-6 cursor-pointer top-1/2 transform -translate-y-1/2 text-white hover:text-gray-700 focus:outline-none transition-colors z-10"
                      aria-label={showPassword ? "Hide password" : "Show password"}
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

              

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 text-sm font-medium hover:bg-transparent cursor-pointer shadow-none bg-transparent bg-[url('/images/assets/input-frame.png')] bg-no-repeat bg-cover bg-center disabled:opacity-50 disabled:cursor-not-allowed transition-all "
                style={{
                  backgroundSize: '100% 100%',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ចុូលប្រព័ន្ធ...
                  </>
                ) : (
                  "ចូល"
                )}
              </Button>
            </form>

            {/* OAuth Buttons */}
            <div className="mt-3 sm:mt-4 md:mt-6 gap-4 sm:gap-5 justify-center items-center flex">
              {/* Google */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                disabled={!!oauthLoading || isLoading}
                className="h-10 sm:h-11 w-10 sm:w-11 p-0 cursor-pointer hover:bg-transparent shadow-none bg-transparent bg-[url('/images/assets/icon-image-circly.png')] bg-no-repeat bg-cover bg-center disabled:opacity-50 disabled:cursor-not-allowed transition-all border-0"
                style={{
                  backgroundSize: '100% 100%',
                }}
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
              </Button>

              {/* GitHub */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                disabled={!!oauthLoading || isLoading}
                className="h-10 sm:h-11 w-10 sm:w-11 p-0 cursor-pointer hover:bg-transparent shadow-none bg-transparent bg-[url('/images/assets/icon-image-circly.png')] bg-no-repeat bg-cover bg-center disabled:opacity-50 disabled:cursor-not-allowed transition-all border-0"
                style={{
                  backgroundSize: '100% 100%',
                }}
              >
                {oauthLoading === "github" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Github className="h-5 w-5 text-white" />
                )}
              </Button>

              {/* LinkedIn */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("linkedin")}
                disabled={!!oauthLoading || isLoading}
                className="h-10 sm:h-11 w-10 sm:w-11 p-0 cursor-pointer hover:bg-transparent shadow-none bg-transparent bg-[url('/images/assets/icon-image-circly.png')] bg-no-repeat bg-cover bg-center disabled:opacity-50 disabled:cursor-not-allowed transition-all border-0"
                style={{
                  backgroundSize: '100% 100%',
                }}
              >
                {oauthLoading === "linkedin" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Linkedin className="h-5 w-5 text-white" />
                )}
              </Button>
            </div>

            {/* Register Link */}
            <div className="mt-3 sm:mt-4 md:mt-6 text-center">
              <span className="text-xs sm:text-sm text-gray-600">
                មិនមានគណនីមែនទេ?{" "}
              </span>
              <Link
                href="/register"
                className="text-xs sm:text-sm text-black hover:underline font-semibold transition-colors"
              >
                បង្កើតគណនី
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
