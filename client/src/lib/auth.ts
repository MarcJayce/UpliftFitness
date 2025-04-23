import { apiRequest } from "./queryClient";
import { User, UserSignupForm, LoginForm, ProfileSetupForm } from "./types";

// Register a new user
export async function registerUser(userData: UserSignupForm): Promise<User> {
  const { username, email, password } = userData;
  const res = await apiRequest("POST", "/api/auth/register", { username, email, password });
  return await res.json();
}

// Login user
export async function loginUser(credentials: LoginForm): Promise<User> {
  const res = await apiRequest("POST", "/api/auth/login", credentials);
  return await res.json();
}

// Logout user
export async function logoutUser(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });
    
    if (res.status === 401) {
      return null;
    }
    
    if (!res.ok) {
      throw new Error(`${res.status}: ${await res.text()}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// Complete user profile setup
export async function completeProfileSetup(profileData: ProfileSetupForm): Promise<User> {
  const res = await apiRequest("POST", "/api/profile/setup", profileData);
  return await res.json();
}

// Update user profile
export async function updateUserProfile(profileData: Partial<ProfileSetupForm>): Promise<User> {
  const res = await apiRequest("PUT", "/api/profile", profileData);
  return await res.json();
}
