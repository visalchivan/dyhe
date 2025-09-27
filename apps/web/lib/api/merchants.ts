import api from "../api";

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  deliverFee: number;
  bank: string;
  bankAccountNumber: string;
  bankAccountName: string;
  address: string;
  googleMapsUrl?: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMerchantDto {
  name: string;
  email: string;
  phone: string;
  deliverFee: number;
  bank: string;
  bankAccountNumber: string;
  bankAccountName: string;
  address: string;
  googleMapsUrl?: string;
  latitude: number;
  longitude: number;
  status?: string;
}

export interface UpdateMerchantDto extends Partial<CreateMerchantDto> {}

export interface MerchantListResponse {
  merchants: Merchant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const merchantApi = {
  // Get all merchants with pagination and search
  getMerchants: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<MerchantListResponse> => {
    const response = await api.get("/merchants", { params });
    return response.data;
  },

  // Get single merchant by ID
  getMerchant: async (id: string): Promise<Merchant> => {
    const response = await api.get(`/merchants/${id}`);
    return response.data;
  },

  // Create new merchant
  createMerchant: async (data: CreateMerchantDto): Promise<Merchant> => {
    const response = await api.post("/merchants", data);
    return response.data;
  },

  // Update merchant
  updateMerchant: async (
    id: string,
    data: UpdateMerchantDto
  ): Promise<Merchant> => {
    const response = await api.patch(`/merchants/${id}`, data);
    return response.data;
  },

  // Delete merchant
  deleteMerchant: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/merchants/${id}`);
    return response.data;
  },
};
