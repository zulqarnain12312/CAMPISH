'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const AuthCallbackPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Authentication failed');
        router.push('/auth/login');
        return;
      }

      if (token) {
        try {
          // Store token and get user info
          localStorage.setItem('token', token);
          
          // Fetch user profile
          const { authAPI } = await import('@/lib/api');
          const response = await authAPI.getProfile();
          const userData = response.data.user;
          
          localStorage.setItem('user', JSON.stringify(userData));
          updateUser(userData);
          
          toast.success('Login successful!');
          router.push('/');
        } catch (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed');
          localStorage.removeItem('token');
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [searchParams, router, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;