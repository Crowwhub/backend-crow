import { IsOptional, IsString } from 'class-validator';

// Page 2: professional info
export class UpdateProfileDto {
  @IsOptional() @IsString()
  personType?: string;

  @IsOptional() @IsString()
  domain?: string;

  @IsOptional() @IsString()
  role?: string;

  @IsOptional() @IsString()
  experienceLevel?: string;
}
