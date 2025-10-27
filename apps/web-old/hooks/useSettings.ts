import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, SettingsResponse } from "../lib/api/settings";
import { message } from "antd";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.getSettingsAsObject,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSettingsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["settings", category],
    queryFn: () => settingsApi.getSettingsByCategory(category),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Record<string, string>) =>
      settingsApi.bulkUpdateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      message.success("Settings updated successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to update settings"
      );
    },
  });
};

export const useCreateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.createSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      message.success("Setting created successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to create setting"
      );
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) =>
      settingsApi.updateSetting(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      message.success("Setting updated successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to update setting"
      );
    },
  });
};

export const useDeleteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.deleteSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      message.success("Setting deleted successfully!");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to delete setting"
      );
    },
  });
};
