import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum PersonType {
  STUDENT = 'student',
  PROFESSIONAL = 'professional',
  FREELANCER = 'freelancer',
}

export class SwipeFeedDto {
  @IsString()
  @MaxLength(80)
  domain!: string;

  // Free-text intent — matched against User.findMeFor on the backend.
  @IsString()
  @MaxLength(80)
  intent!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(PersonType)
  personType?: PersonType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  interest?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  goal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  skill?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
