import api from "../api";

export interface ReportsQuery {
  driverId?: string;
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  type?: "driver" | "merchant" | "package" | "summary";
}

export interface DriverReportItem {
  id: string;
  packageNumber: string;
  shipmentCreateDate: string;
  shipmentDeliveryDate?: string;
  receiverName: string;
  address: string;
  contact: string;
  cashCollectionAmount: number;
  driverName?: string;
  merchantName: string;
  status: string;
}

export interface MerchantReportItem {
  id: string;
  packageNumber: string;
  shipmentCreateDate: string;
  shipmentDeliveryDate?: string;
  receiverName: string;
  address: string;
  contact: string;
  cashCollectionAmount: number;
  deliveryFee: number;
  driverName?: string;
  merchantName: string;
  status: string;
}

export interface PackageAnalytics {
  totalPackages: number;
  totalCOD: number;
  totalDeliveryFee: number;
  deliveredPackages: number;
  pendingPackages: number;
  cancelledPackages: number;
  returnedPackages: number;
  averageDeliveryTime?: number;
}

export interface ReportsResponse {
  data: DriverReportItem[] | MerchantReportItem[];
  analytics: PackageAnalytics;
  total: number;
  page: number;
  limit: number;
}

export const reportsApi = {
  getReports: async (query: ReportsQuery): Promise<ReportsResponse> => {
    const params = new URLSearchParams();

    if (query.driverId) params.append("driverId", query.driverId);
    if (query.merchantId) params.append("merchantId", query.merchantId);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);
    if (query.search) params.append("search", query.search);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.type) params.append("type", query.type);

    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  },

  getDriverReports: async (query: ReportsQuery): Promise<ReportsResponse> => {
    const params = new URLSearchParams();

    if (query.driverId) params.append("driverId", query.driverId);
    if (query.merchantId) params.append("merchantId", query.merchantId);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);
    if (query.search) params.append("search", query.search);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());

    const response = await api.get(`/reports/drivers?${params.toString()}`);
    return response.data;
  },

  getMerchantReports: async (query: ReportsQuery): Promise<ReportsResponse> => {
    const params = new URLSearchParams();

    if (query.driverId) params.append("driverId", query.driverId);
    if (query.merchantId) params.append("merchantId", query.merchantId);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);
    if (query.search) params.append("search", query.search);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());

    const response = await api.get(`/reports/merchants?${params.toString()}`);
    return response.data;
  },

  exportToExcel: async (query: ReportsQuery): Promise<Blob> => {
    const params = new URLSearchParams();

    if (query.driverId) params.append("driverId", query.driverId);
    if (query.merchantId) params.append("merchantId", query.merchantId);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);
    if (query.search) params.append("search", query.search);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.type) params.append("type", query.type);

    const response = await api.get(
      `/reports/export/excel?${params.toString()}`,
      { responseType: "blob" }
    );
    return response.data;
  },
};
