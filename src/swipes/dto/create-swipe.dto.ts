import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export enum SwipeDirection {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export class SwipeFiltersDto {
  @IsOptional() @IsString() @MaxLength(40)
  personType?: string;

  @IsOptional() @IsString() @MaxLength(120)
  location?: string;

  @IsOptional() @IsString() @MaxLength(80)
  interest?: string;

  @IsOptional() @IsString() @MaxLength(120)
  goal?: string;

  @IsOptional() @IsString() @MaxLength(80)
  skill?: string;
}

export class CreateSwipeDto {
  @IsString()
  @IsNotEmpty()
  swipedId!: string;

  @IsEnum(SwipeDirection)
  direction!: SwipeDirection;

  // Optional findMeFor value the swiper was filtering on at the moment.
  @IsOptional()
  @IsString()
  @MaxLength(80)
  intent?: string;

  // Optional domain the swiper was filtering on at the moment.
  @IsOptional()
  @IsString()
  @MaxLength(80)
  domain?: string;

  // Optional advanced filters that were active at swipe time.
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SwipeFiltersDto)
  filters?: SwipeFiltersDto;
}
