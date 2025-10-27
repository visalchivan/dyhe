import { useQuery } from "@tanstack/react-query";
import { reportsApi, ReportsQuery } from "../lib/api/reports";

export const useReports = (query: ReportsQuery) => {
  return useQuery({
    queryKey: ["reports", query],
    queryFn: () => reportsApi.getReports(query),
    staleTime: 30000, // 30 seconds
  });
};

export const useDriverReports = (query: ReportsQuery) => {
  return useQuery({
    queryKey: ["driver-reports", query],
    queryFn: () => reportsApi.getDriverReports(query),
    staleTime: 30000,
  });
};

export const useMerchantReports = (query: ReportsQuery) => {
  return useQuery({
    queryKey: ["merchant-reports", query],
    queryFn: () => reportsApi.getMerchantReports(query),
    staleTime: 30000,
  });
};

export const useDriverPerformance = (
  driverId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ["driver-performance", driverId, startDate, endDate],
    queryFn: () =>
      reportsApi.getDriverPerformance(driverId, startDate, endDate),
    staleTime: 30000,
  });
};

export const useMerchantPerformance = (
  merchantId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ["merchant-performance", merchantId, startDate, endDate],
    queryFn: () =>
      reportsApi.getMerchantPerformance(merchantId, startDate, endDate),
    staleTime: 30000,
  });
};
