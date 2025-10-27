import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  teamApi,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
} from "../lib/api/team";
import { message } from "antd";

export const useTeam = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["team", params],
    queryFn: () => teamApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => teamApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => teamApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      message.success("User created successfully!");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      teamApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      message.success("User updated successfully!");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update user");
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordDto }) =>
      teamApi.changePassword(id, data),
    onSuccess: () => {
      message.success("Password changed successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to change password"
      );
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      message.success("User deleted successfully!");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete user");
    },
  });
};
