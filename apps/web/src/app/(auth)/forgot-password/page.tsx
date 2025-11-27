import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

function ForgotPasswordFormWrapper() {
  return (
    <div className="w-full relative z-20 max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[450px] mx-auto">
      <ForgotPasswordForm />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen relative h-screen w-full flex items-center justify-center ">
      <div className="bg-[url('/images/login-background.png')] bg-contain bg-center bg-no-repeat inset-0 absolute sm:scale-100 scale-150"></div>
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <ForgotPasswordFormWrapper />
      </Suspense>
    </div>
  );
}
