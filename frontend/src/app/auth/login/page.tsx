// src/app/login/page.tsx
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
    return (
   
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-lime-600">
        <p className="text-white">Carregando interface...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}