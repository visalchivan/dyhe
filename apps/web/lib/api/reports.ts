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
  trackingNumber: string;
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
  trackingNumber: string;
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

export interface DriverPerformance {
  driverId: string;
  driverName: string;
  totalPackages: number;
  deliveredPackages: number;
  deliveryRate: number;
  totalCOD: number;
  totalDeliveryFee: number;
  packages: Array<{
    id: string;
    packageNumber: string;
    merchantName: string;
    customerName: string;
    status: string;
    codAmount: number;
    deliveryFee: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface MerchantPerformance {
  merchantId: string;
  merchantName: string;
  totalPackages: number;
  deliveredPackages: number;
  deliveryRate: number;
  totalCOD: number;
  totalDeliveryFee: number;
  packages: Array<{
    id: string;
    packageNumber: string;
    driverName: string;
    customerName: string;
    status: string;
    codAmount: number;
    deliveryFee: number;
    createdAt: string;
    updatedAt: string;
  }>;
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

  getDriverPerformance: async (
    driverId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<DriverPerformance[]> => {
    const params = new URLSearchParams();

    if (driverId) params.append("driverId", driverId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/driver-performance?${params.toString()}`
    );
    return response.data;
  },

  getMerchantPerformance: async (
    merchantId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<MerchantPerformance[]> => {
    const params = new URLSearchParams();

    if (merchantId) params.append("merchantId", merchantId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/merchant-performance?${params.toString()}`
    );
    return response.data;
  },

  exportToCSV: async (query: ReportsQuery): Promise<Blob> => {
    const params = new URLSearchParams();

    if (query.driverId) params.append("driverId", query.driverId);
    if (query.merchantId) params.append("merchantId", query.merchantId);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);
    if (query.search) params.append("search", query.search);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.type) params.append("type", query.type);

    const response = await api.get(`/reports/export/csv?${params.toString()}`, {
      responseType: "blob",
    });
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
    if (query.type) params.append("type", query.type!);

    const response = await api.get(
      `/reports/export/excel?${params.toString()}`,
      { responseType: "blob" }
    );
    return response.data;
  },
  exportMerchantExcel: async (merchantId: string, date?: string): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append("merchantId", merchantId);
    if (date) params.append("date", date);
    const response = await api.get(
      `/reports/export/excel-per-merchant?${params.toString()}`,
      { responseType: "blob" }
    );
    return response.data;
  },
};
