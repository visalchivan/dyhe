import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  driverApi,
  type CreateDriverDto,
  type UpdateDriverDto,
} from "../lib/api/drivers";

export const useDrivers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => driverApi.getDrivers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDriver = (id: string) => {
  return useQuery({
    queryKey: ["driver", id],
    queryFn: () => driverApi.getDriver(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDriverDto) => driverApi.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create driver");
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDriverDto }) =>
      driverApi.updateDriver(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver", id] });
      toast.success("Driver updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update driver");
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => driverApi.deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete driver");
    },
  });
};

export const useChangeDriverPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      driverApi.changeDriverPassword(id, newPassword),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["driver", id] });
      toast.success("Driver password changed successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to change driver password"
      );
    },
  });
};

