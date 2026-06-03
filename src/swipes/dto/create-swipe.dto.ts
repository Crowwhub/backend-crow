import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum SwipeDirection {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
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
}
