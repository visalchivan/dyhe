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

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  ON_DUTY = 'ON_DUTY',
  OFF_DUTY = 'OFF_DUTY',
  SUSPENDED = 'SUSPENDED',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class CreateDriverDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  email?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  deliverFee: number;

  @IsEnum(DriverStatus)
  driverStatus: DriverStatus;

  @IsEnum(Bank)
  bank: Bank;

  @IsString()
  @MinLength(8, { message: 'Bank account number must be at least 8 digits' })
  bankAccountNumber: string;

  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
