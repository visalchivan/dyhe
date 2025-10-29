import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api/dashboard";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

export const useRecentPackages = (limit?: number) => {
  return useQuery({
    queryKey: ["dashboard", "recent-packages", limit],
    queryFn: () => dashboardApi.getRecentPackages(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePackageStatusDistribution = () => {
  return useQuery({
    queryKey: ["dashboard", "package-status-distribution"],
    queryFn: () => dashboardApi.getPackageStatusDistribution(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTopMerchants = (limit?: number) => {
  return useQuery({
    queryKey: ["dashboard", "top-merchants", limit],
    queryFn: () => dashboardApi.getTopMerchants(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTopDrivers = (limit?: number) => {
  return useQuery({
    queryKey: ["dashboard", "top-drivers", limit],
    queryFn: () => dashboardApi.getTopDrivers(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
