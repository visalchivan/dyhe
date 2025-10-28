import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsApi } from "../lib/api/settings";

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
      toast.success("Settings updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
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
      toast.success("Setting created successfully!");
    },
    onError: (error: any) => {
      toast.error(
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
      toast.success("Setting updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
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
      toast.success("Setting deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete setting"
      );
    },
  });
};
