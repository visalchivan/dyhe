import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authApi, LoginRequest, RegisterRequest, User } from "../lib/auth";

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
      // Store tokens in cookies
      Cookies.set("accessToken", data.accessToken, { expires: 1 }); // 1 day
      Cookies.set("refreshToken", data.refreshToken, { expires: 7 }); // 7 days

      // Update profile in cache
      queryClient.setQueryData(authKeys.profile(), data.user);

      // Redirect to dashboard
      router.push("/dashboard");
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
      // Store tokens in cookies
      Cookies.set("accessToken", data.accessToken, { expires: 1 }); // 1 day
      Cookies.set("refreshToken", data.refreshToken, { expires: 7 }); // 7 days

      // Update profile in cache
      queryClient.setQueryData(authKeys.profile(), data.user);

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear tokens from cookies
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      // Clear all cached data
      queryClient.clear();

      // Redirect to sign-in
      router.push("/sign-in");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Even if logout fails on server, clear local data
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      queryClient.clear();
      router.push("/sign-in");
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
