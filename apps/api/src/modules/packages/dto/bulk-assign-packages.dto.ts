import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { PackageStatus } from 'generated/client';

export class BulkAssignPackagesDto {
  @IsString()
  driverId: string;

  @IsArray()
  @IsString({ each: true })
  packageNumbers: string[];

  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;
}
