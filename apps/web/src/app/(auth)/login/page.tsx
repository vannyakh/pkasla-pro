import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

function LoginFormWrapper() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <div className="mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}

