import React, { useState } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useUser } from '@/hooks/use-user';
import { UserSignupForm, LoginForm as LoginFormType } from '@/lib/types';

export default function Welcome() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { register, login, isRegistering, isLoggingIn } = useUser();

  const handleRegister = (data: UserSignupForm) => {
    register(data);
  };

  const handleLogin = (data: LoginFormType) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-background to-background/90">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-poppins font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light animate-gradient">
            Uplift
          </h1>
          <p className="text-xl text-muted-foreground">Your complete fitness journey</p>
        </div>

        {mode === 'register' ? (
          <>
            <RegisterForm onSubmit={handleRegister} isLoading={isRegistering} />
            <p className="mt-6 text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary font-medium hover:underline focus:outline-none"
              >
                Log in
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginForm onSubmit={handleLogin} isLoading={isLoggingIn} />
            <p className="mt-6 text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-primary font-medium hover:underline focus:outline-none"
              >
                Create an account
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
