import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
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

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  deliverFee: number;

  @IsEnum(DriverStatus)
  driverStatus: DriverStatus;

  @IsEnum(Bank)
  bank: Bank;

  @IsString()
  bankAccountNumber: string;

  @IsString()
  bankAccountName: string;

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
