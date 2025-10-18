import api from "../api";

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsResponse {
  [key: string]: string;
}

export const settingsApi = {
  // Get all settings
  getSettings: async (): Promise<Setting[]> => {
    const response = await api.get("/settings");
    return response.data;
  },

  // Get settings by category
  getSettingsByCategory: async (category: string): Promise<Setting[]> => {
    const response = await api.get(`/settings/category/${category}`);
    return response.data;
  },

  // Get settings as key-value object
  getSettingsAsObject: async (): Promise<SettingsResponse> => {
    const response = await api.get("/settings/object");
    return response.data;
  },

  // Get single setting by key
  getSettingByKey: async (key: string): Promise<Setting> => {
    const response = await api.get(`/settings/key/${key}`);
    return response.data;
  },

  // Create new setting
  createSetting: async (data: {
    key: string;
    value: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
  }): Promise<Setting> => {
    const response = await api.post("/settings", data);
    return response.data;
  },

  // Update setting by key
  updateSetting: async (
    key: string,
    data: {
      value?: string;
      description?: string;
      category?: string;
      isPublic?: boolean;
    }
  ): Promise<Setting> => {
    const response = await api.put(`/settings/${key}`, data);
    return response.data;
  },

  // Delete setting by key
  deleteSetting: async (key: string): Promise<{ message: string }> => {
    const response = await api.delete(`/settings/${key}`);
    return response.data;
  },

  // Bulk update settings
  bulkUpdateSettings: async (
    settings: Record<string, string>
  ): Promise<{ message: string }> => {
    const response = await api.post("/settings/bulk-update", settings);
    return response.data;
  },
};
