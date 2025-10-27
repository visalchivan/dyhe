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
  packageNumber: string;
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
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  // Get recent packages
  getRecentPackages: async (limit?: number): Promise<RecentPackage[]> => {
    const response = await api.get("/dashboard/recent-packages", {
      params: { limit },
    });
    return response.data;
  },

  // Get package status distribution
  getPackageStatusDistribution: async (): Promise<
    PackageStatusDistribution[]
  > => {
    const response = await api.get("/dashboard/package-status-distribution");
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
