export class DriverResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}
