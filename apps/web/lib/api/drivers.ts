import api from "../api";

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  deliverFee: number;
  driverStatus: string;
  bank: string;
  bankAccountNumber: string;
  bankAccountName: string;
  googleMapsUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverDto {
  name: string;
  email: string;
  phone: string;
  username?: string;
  password?: string;
  deliverFee: number;
  driverStatus: string;
  bank: string;
  bankAccountNumber: string;
  bankAccountName: string;
  googleMapsUrl?: string;
  status?: string;
}

export interface UpdateDriverDto extends Partial<CreateDriverDto> {}

export interface DriverListResponse {
  drivers: Driver[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const driverApi = {
  // Get all drivers with pagination and search
  getDrivers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<DriverListResponse> => {
    const response = await api.get("/drivers", { params });
    return response.data;
  },

  // Get single driver by ID
  getDriver: async (id: string): Promise<Driver> => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  // Create new driver
  createDriver: async (data: CreateDriverDto): Promise<Driver> => {
    const response = await api.post("/drivers", data);
    return response.data;
  },

  // Update driver
  updateDriver: async (id: string, data: UpdateDriverDto): Promise<Driver> => {
    const response = await api.patch(`/drivers/${id}`, data);
    return response.data;
  },

  // Delete driver
  deleteDriver: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },

  // Change driver password
  changeDriverPassword: async (
    id: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.patch(`/drivers/${id}/change-password`, {
      newPassword,
    });
    return response.data;
  },
};
