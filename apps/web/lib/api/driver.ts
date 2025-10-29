import api from "../api";

export interface DriverPackage {
  id: string;
  packageNumber: string;
  name: string;
  price: number;
  codAmount: number;
  deliveryFee: number;
  status: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLatitude: number | null;
  customerLongitude: number | null;
  customerGoogleMapsUrl: string | null;
  merchant: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DriverStats {
  total: number;
  delivering: number;
  delivered: number;
  cancelled: number;
  returned: number;
  todayDelivered: number;
  totalCOD: number;
}

export interface UpdatePackageStatusDto {
  status: string;
  notes?: string;
}

export const driverApi = {
  // Get driver's assigned packages
  getMyPackages: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    packages: DriverPackage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get("/driver/packages", { params });
    return response.data;
  },

  // Get single package details
  getPackageById: async (id: string): Promise<DriverPackage> => {
    const response = await api.get(`/driver/packages/${id}`);
    return response.data;
  },

  // Update package status
  updatePackageStatus: async (
    id: string,
    data: UpdatePackageStatusDto
  ): Promise<DriverPackage> => {
    const response = await api.patch(`/driver/packages/${id}/status`, data);
    return response.data;
  },

  // Get driver stats
  getMyStats: async (): Promise<DriverStats> => {
    const response = await api.get("/driver/packages/stats/summary");
    return response.data;
  },
};
