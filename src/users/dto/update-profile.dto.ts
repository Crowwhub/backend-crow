import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  personType?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  interests?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  favouriteTools?: string[];

  @IsOptional() @IsString()
  promptTagline?: string;

  @IsOptional() @IsString()
  madeTillFar?: string;
}
