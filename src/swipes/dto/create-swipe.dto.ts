import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum SwipeDirection {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export class CreateSwipeDto {
  @IsString()
  @IsNotEmpty()
  swipedId: string;

  @IsEnum(SwipeDirection)
  direction: SwipeDirection;
}
