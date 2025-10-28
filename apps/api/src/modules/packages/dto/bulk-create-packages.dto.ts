import {
  IsString,
  IsNumber,
  IsEnum,
  IsPositive,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PackageStatus } from 'generated/client';

export class PackageDataDto {
  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsString()
  customerAddress: string;

  @IsOptional()
  @IsNumber()
  codAmount?: number; // Optional

  @IsOptional()
  @IsNumber()
  deliveryFee?: number; // Optional
}

export class BulkCreatePackagesDto {
  @IsString()
  merchantId: string;

  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageDataDto)
  packages: PackageDataDto[];
}
