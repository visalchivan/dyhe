import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum Bank {
  ABA = 'ABA',
  ACELEDA = 'ACELEDA',
  WING = 'WING',
  CANADIA = 'CANADIA',
  SATHAPANA = 'SATHAPANA',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class CreateMerchantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  email?: string;

  @IsString()
  phone: string;

  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  deliverFee: number;

  @IsEnum(Bank)
  bank: Bank;

  @IsString()
  @MinLength(8, { message: 'Bank account number must be at least 8 digits' })
  bankAccountNumber: string;

  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
