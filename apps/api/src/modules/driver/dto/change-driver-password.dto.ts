import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeDriverPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
