export class MerchantResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}
