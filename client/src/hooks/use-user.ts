import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { getCurrentUser, loginUser, logoutUser, registerUser, completeProfileSetup, updateUserProfile } from "@/lib/auth";
import { UserSignupForm, LoginForm, ProfileSetupForm, User } from "@/lib/types";

export function useUser() {
  const { toast } = useToast();

  // Get current user
  const userQuery = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: UserSignupForm) => registerUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Success",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginForm) => loginUser(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Success",
        description: "You've been logged in successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.clear();
      toast({
        title: "Success",
        description: "You've been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete profile setup mutation
  const profileSetupMutation = useMutation({
    mutationFn: (profileData: ProfileSetupForm) => completeProfileSetup(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Success",
        description: "Your profile has been set up successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profile setup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<ProfileSetupForm>) => updateUserProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const user = userQuery.data as User | null;
  const isLoading = userQuery.isLoading;
  const isError = userQuery.isError;
  const error = userQuery.error;
  const profileComplete = !!user?.fullName && !!user?.age && !!user?.weight;

  return {
    user,
    isLoading,
    isError,
    error,
    profileComplete,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    setupProfile: profileSetupMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isSettingUpProfile: profileSetupMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
}
