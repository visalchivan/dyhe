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
  name: string;

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsString()
  customerAddress: string;

  @IsNumber()
  @IsPositive()
  codAmount: number;

  @IsNumber()
  @IsPositive()
  deliveryFee: number;
}

export class BulkCreatePackagesDto {
  @IsString()
  merchantId: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageDataDto)
  @Min(1, { message: 'At least one package is required' })
  @Max(100, { message: 'Cannot create more than 100 packages at once' })
  packages: PackageDataDto[];
}
