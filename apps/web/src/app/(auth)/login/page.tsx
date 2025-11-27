import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

function LoginFormWrapper() {
  return (
    <div className="w-full relative z-20 max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[450px] mx-auto">
      <LoginForm />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen relative h-screen w-full flex items-center justify-center ">
      <div className="bg-[url('/images/login-background.png')] bg-contain bg-center bg-no-repeat inset-0 absolute sm:scale-100 scale-150"></div>
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <LoginFormWrapper />
      </Suspense>
    </div>
  );
}
