import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PackageStatus } from '../../../../generated/client';

export class UpdatePackageStatusDto {
  @IsEnum(PackageStatus)
  status: PackageStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
