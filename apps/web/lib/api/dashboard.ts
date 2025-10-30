import api from "../api";

export interface DashboardStats {
  totalReceived: number;
  totalDelivered: number;
  totalPending: number;
  onDelivery: number;
  totalFailed: number;
  totalReturned: number;
}

export interface RecentPackage {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  merchant: {
    name: string;
    email: string;
  };
  driver?: {
    name: string;
    email: string;
  };
}

export interface PackageStatusDistribution {
  status: string;
  count: number;
}

export interface TopMerchant {
  id: string;
  name: string;
  email: string;
  _count: {
    packages: number;
  };
}

export interface TopDriver {
  id: string;
  name: string;
  email: string;
  _count: {
    packages: number;
  };
}

export const dashboardApi = {
  // Get dashboard statistics
  getDashboardStats: async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const response = await api.get("/dashboard/stats", {
      params: {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
    });
    return response.data;
  },

  // Get recent packages
  getRecentPackages: async (limit?: number, startDate?: string, endDate?: string): Promise<RecentPackage[]> => {
    const params: any = {};
    if (limit != null) params.limit = limit;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get("/dashboard/recent-packages", { params });
    return response.data;
  },

  // Get package status distribution
  getPackageStatusDistribution: async (startDate?: string, endDate?: string): Promise<PackageStatusDistribution[]> => {
    const response = await api.get("/dashboard/package-status-distribution", {
      params: {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
    });
    return response.data;
  },

  // Get top merchants
  getTopMerchants: async (limit?: number): Promise<TopMerchant[]> => {
    const response = await api.get("/dashboard/top-merchants", {
      params: { limit },
    });
    return response.data;
  },

  // Get top drivers
  getTopDrivers: async (limit?: number): Promise<TopDriver[]> => {
    const response = await api.get("/dashboard/top-drivers", {
      params: { limit },
    });
    return response.data;
  },
};
