import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApi, UpdatePackageStatusDto } from "../lib/api/driver";
import { message } from "antd";

export const driverPackagesKeys = {
  all: ["driver-packages"] as const,
  lists: () => [...driverPackagesKeys.all, "list"] as const,
  list: (filters: { page?: number; limit?: number; status?: string }) =>
    [...driverPackagesKeys.lists(), filters] as const,
  details: () => [...driverPackagesKeys.all, "detail"] as const,
  detail: (id: string) => [...driverPackagesKeys.details(), id] as const,
  stats: () => [...driverPackagesKeys.all, "stats"] as const,
};

// Get driver's packages
export const useDriverPackages = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: driverPackagesKeys.list(params || {}),
    queryFn: () => driverApi.getMyPackages(params),
  });
};

// Get single package
export const useDriverPackage = (id: string) => {
  return useQuery({
    queryKey: driverPackagesKeys.detail(id),
    queryFn: () => driverApi.getPackageById(id),
    enabled: !!id,
  });
};

// Get driver stats
export const useDriverStats = () => {
  return useQuery({
    queryKey: driverPackagesKeys.stats(),
    queryFn: () => driverApi.getMyStats(),
  });
};

// Update package status
export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageStatusDto }) =>
      driverApi.updatePackageStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverPackagesKeys.all });
      message.success("Package status updated successfully");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to update package status"
      );
    },
  });
};
