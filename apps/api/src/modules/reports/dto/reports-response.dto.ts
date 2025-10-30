import { PackageStatus } from '../../../../generated/client';

export class DriverReportDto {
  id: string;
  packageNumber: string;
  shipmentCreateDate: Date;
  shipmentDeliveryDate?: Date;
  receiverName: string;
  address: string;
  contact: string;
  trackingNumber: string;
  cashCollectionAmount: number;
  driverName?: string;
  merchantName: string;
  status: PackageStatus;
}

export class MerchantReportDto {
  id: string;
  packageNumber: string;
  shipmentCreateDate: Date;
  shipmentDeliveryDate?: Date;
  receiverName: string;
  address: string;
  contact: string;
  trackingNumber: string;
  cashCollectionAmount: number;
  deliveryFee: number;
  driverName?: string;
  merchantName: string;
  status: PackageStatus;
}

export class PackageAnalyticsDto {
  totalPackages: number;
  totalCOD: number;
  totalDeliveryFee: number;
  deliveredPackages: number;
  pendingPackages: number;
  cancelledPackages: number;
  returnedPackages: number;
  failedPackages: number;
  averageDeliveryTime?: number; // in hours
}

export class ReportsResponseDto {
  data: DriverReportDto[] | MerchantReportDto[];
  analytics: PackageAnalyticsDto;
  total: number;
  page: number;
  limit: number;
}
