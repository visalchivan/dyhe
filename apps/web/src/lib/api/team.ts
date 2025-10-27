import api from "../api";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  role?: string;
  status?: string;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, "password">> {}

export interface ChangePasswordDto {
  newPassword: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const teamApi = {
  // Get all users with pagination and search
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UserListResponse> => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // Get single user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post("/users", data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Change user password
  changePassword: async (
    id: string,
    data: ChangePasswordDto
  ): Promise<{ message: string }> => {
    const response = await api.patch(`/users/${id}/change-password`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
