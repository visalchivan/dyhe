import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import Cookies from "js-cookie";
import type { LoginRequest, RegisterRequest } from "../lib/auth";
import { authApi } from "../lib/auth";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// Get current user profile
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: !!Cookies.get("accessToken"),
    retry: false,
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // Store tokens in cookies with longer expiration
      Cookies.set("accessToken", data.accessToken, { expires: 7 }); // 7 days
      Cookies.set("refreshToken", data.refreshToken, { expires: 30 }); // 30 days

      // Clear all cache to ensure fresh data for new user
      queryClient.clear();

      // Update profile in cache
      queryClient.setQueryData(authKeys.profile(), data.user);

      // Force a hard refresh to reload the layout with correct user role
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      // Store tokens in cookies with longer expiration
      Cookies.set("accessToken", data.accessToken, { expires: 7 }); // 7 days
      Cookies.set("refreshToken", data.refreshToken, { expires: 30 }); // 30 days

      // Update profile in cache
      queryClient.setQueryData(authKeys.profile(), data.user);

      // Redirect to dashboard
      router.navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear tokens from cookies
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      // Clear all cached data
      queryClient.clear();

      // Force hard refresh to sign-in to ensure clean state
      window.location.href = "/login";
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Even if logout fails on server, clear local data
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      queryClient.clear();
      // Force hard refresh to sign-in
      window.location.href = "/login";
    },
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  const { data: profile, isLoading, error } = useProfile();

  return {
    isAuthenticated: !!profile && !error,
    isLoading,
    user: profile,
  };
};

