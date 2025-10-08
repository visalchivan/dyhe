import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ReportType {
  DRIVER = 'driver',
  DRIVERS = 'drivers', // Support both for backward compatibility
  MERCHANT = 'merchant',
  MERCHANTS = 'merchants', // Support both for backward compatibility
  PACKAGE = 'package',
  PACKAGES = 'packages', // Support both for backward compatibility
  SUMMARY = 'summary',
}

export class ReportsQueryDto {
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 1000;

  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType = ReportType.PACKAGE;
}
