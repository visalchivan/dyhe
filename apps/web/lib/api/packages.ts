import api from "../api";

export interface Package {
  id: string;
  packageNumber: string;
  name: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  codAmount: number;
  deliveryFee: number;
  status: string;
  merchantId: string;
  merchant: {
    id: string;
    name: string;
    email: string;
  };
  driverId?: string;
  driver?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageDto {
  name: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  codAmount: number;
  deliveryFee: number;
  merchantId: string;
  driverId?: string;
  status?: string;
}

export interface PackageDataDto {
  name?: string; // Auto-generated, optional in input
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  codAmount?: number; // Optional
  deliveryFee?: number; // Optional
}

export interface BulkCreatePackagesDto {
  merchantId: string;
  status?: string;
  packages: PackageDataDto[];
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {
  id?: string;
}

export interface PackageListResponse {
  packages: Package[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkCreateResponse {
  message: string;
  packages: Package[];
  count: number;
}

export interface BulkAssignPackagesDto {
  driverId: string;
  packageNumbers: string[];
  status?: string;
}

export interface BulkAssignResponse {
  message: string;
  packages: Package[];
  count: number;
}

export const packagesApi = {
  // Get all packages with pagination and search
  getPackages: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    merchantId?: string;
    driverId?: string;
  }): Promise<PackageListResponse> => {
    const response = await api.get("/packages", { params });
    return response.data;
  },

  // Get single package by ID
  getPackage: async (id: string): Promise<Package> => {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  // Create new package
  createPackage: async (data: CreatePackageDto): Promise<Package> => {
    const response = await api.post("/packages", data);
    return response.data;
  },

  // Bulk create packages
  bulkCreatePackages: async (
    data: BulkCreatePackagesDto
  ): Promise<BulkCreateResponse> => {
    const response = await api.post("/packages/bulk", data);
    return response.data;
  },

  // Bulk assign packages to driver
  bulkAssignPackages: async (
    data: BulkAssignPackagesDto
  ): Promise<BulkAssignResponse> => {
    const response = await api.post("/packages/bulk-assign", data);
    return response.data;
  },

  // Update package
  updatePackage: async (
    id: string,
    data: UpdatePackageDto
  ): Promise<Package> => {
    const response = await api.patch(`/packages/${id}`, data);
    return response.data;
  },

  // Delete package
  deletePackage: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  },
};
