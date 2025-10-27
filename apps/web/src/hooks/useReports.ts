import { useQuery } from "@tanstack/react-query";
import { reportsApi, type ReportsQuery } from "../lib/api/reports";

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
