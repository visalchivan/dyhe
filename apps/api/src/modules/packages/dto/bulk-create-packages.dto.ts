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
  @IsOptional()
  @IsString()
  name?: string; // Auto-generated, optional in input

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageDataDto)
  packages: PackageDataDto[];
}
