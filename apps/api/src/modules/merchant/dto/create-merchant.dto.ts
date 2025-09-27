import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUrl,
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

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  deliverFee: number;

  @IsEnum(Bank)
  bank: Bank;

  @IsString()
  bankAccountNumber: string;

  @IsString()
  bankAccountName: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsUrl()
  googleMapsUrl?: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  latitude: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
