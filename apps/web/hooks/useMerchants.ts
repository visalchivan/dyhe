import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  merchantApi,
  CreateMerchantDto,
  UpdateMerchantDto,
} from "../lib/api/merchants";
import { message } from "antd";

export const useMerchants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["merchants", params],
    queryFn: () => merchantApi.getMerchants(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMerchant = (id: string) => {
  return useQuery({
    queryKey: ["merchant", id],
    queryFn: () => merchantApi.getMerchant(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMerchantDto) => merchantApi.createMerchant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      message.success("Merchant created successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to create merchant"
      );
    },
  });
};

export const useUpdateMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMerchantDto }) =>
      merchantApi.updateMerchant(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({ queryKey: ["merchant", id] });
      message.success("Merchant updated successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to update merchant"
      );
    },
  });
};

export const useDeleteMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => merchantApi.deleteMerchant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      message.success("Merchant deleted successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to delete merchant"
      );
    },
  });
};
