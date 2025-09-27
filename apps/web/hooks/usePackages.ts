import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  packagesApi,
  CreatePackageDto,
  BulkCreatePackagesDto,
  UpdatePackageDto,
} from "../lib/api/packages";
import { message } from "antd";

export const usePackages = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["packages", params],
    queryFn: () => packagesApi.getPackages(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePackage = (id: string) => {
  return useQuery({
    queryKey: ["package", id],
    queryFn: () => packagesApi.getPackage(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePackageDto) => packagesApi.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      message.success("Package created successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to create package"
      );
    },
  });
};

export const useBulkCreatePackages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreatePackagesDto) =>
      packagesApi.bulkCreatePackages(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      message.success(`Successfully created ${data.count} packages!`);
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to create packages"
      );
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageDto }) =>
      packagesApi.updatePackage(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["package", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      message.success("Package updated successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to update package"
      );
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => packagesApi.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      message.success("Package deleted successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to delete package"
      );
    },
  });
};
