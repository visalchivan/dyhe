export class PackageResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}
