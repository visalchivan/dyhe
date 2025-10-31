import { IsOptional, IsBoolean, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePackageIssueDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasIssue?: boolean;

  @IsOptional()
  @IsString()
  issueNote?: string | null;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  extraDeliveryFee?: number;
}
