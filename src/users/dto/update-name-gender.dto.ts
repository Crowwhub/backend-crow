import { IsOptional, IsString } from 'class-validator';

export class UpdateNameGenderDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  gender?: string;
}
