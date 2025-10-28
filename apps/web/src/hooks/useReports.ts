import { useQuery } from "@tanstack/react-query";
import { packagesApi } from "@/lib/api/packages";

interface ReportsQuery {
  driverId?: string;
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  type?: "packages" | "merchants" | "drivers";
}

export function useReports(query: ReportsQuery) {
  return useQuery({
    queryKey: ["reports", query],
    queryFn: () => packagesApi.getReports(query),
    enabled: false, // Only run when explicitly called
  });
}

export function useDriverReports(query: Omit<ReportsQuery, "type">) {
  return useQuery({
    queryKey: ["driver-reports", query],
    queryFn: () => packagesApi.getReports({ ...query, type: "drivers" }),
    enabled: false,
  });
}

export function useMerchantReports(query: Omit<ReportsQuery, "type">) {
  return useQuery({
    queryKey: ["merchant-reports", query],
    queryFn: () => packagesApi.getReports({ ...query, type: "merchants" }),
    enabled: false,
  });
}