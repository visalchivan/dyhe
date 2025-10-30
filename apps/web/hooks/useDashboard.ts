import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api/dashboard";

export const useDashboardStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["dashboard", "stats", startDate, endDate],
    queryFn: () => dashboardApi.getDashboardStats(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

export const useRecentPackages = (limit?: number, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["dashboard", "recent-packages", limit, startDate, endDate],
    queryFn: () => dashboardApi.getRecentPackages(limit, startDate, endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePackageStatusDistribution = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["dashboard", "package-status-distribution", startDate, endDate],
    queryFn: () => dashboardApi.getPackageStatusDistribution(startDate, endDate),
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
