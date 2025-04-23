import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { User, UserSignupForm, LoginForm } from '@/lib/types';

export type AuthState = 'loggedOut' | 'loggedIn' | 'setupRequired';

export function useAuth() {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>('loggedOut');

  // Get current user
  const userQuery = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          setAuthState('loggedOut');
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${await res.text()}`);
        }
        
        const userData = await res.json() as User;
        
        // Check if profile is complete
        if (userData.fullName && userData.age && userData.weight) {
          setAuthState('loggedIn');
        } else {
          setAuthState('setupRequired');
        }
        
        return userData;
      } catch (error) {
        console.error('Error fetching current user:', error);
        setAuthState('loggedOut');
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: UserSignupForm) => {
      const { username, email, password } = userData;
      const res = await apiRequest('POST', '/api/auth/register', { username, email, password });
      return await res.json() as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setAuthState('setupRequired');
      toast({
        title: 'Success',
        description: 'Your account has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginForm) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      return await res.json() as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      if (data.fullName && data.age && data.weight) {
        setAuthState('loggedIn');
      } else {
        setAuthState('setupRequired');
      }
      toast({
        title: 'Success',
        description: "You've been logged in successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.clear();
      setAuthState('loggedOut');
      toast({
        title: 'Success',
        description: "You've been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const user = userQuery.data as User | null;
  const isLoading = userQuery.isLoading;
  const isError = userQuery.isError;
  const error = userQuery.error;

  return {
    user,
    authState,
    isLoading,
    isError,
    error,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
