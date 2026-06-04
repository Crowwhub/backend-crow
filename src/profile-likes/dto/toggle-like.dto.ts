import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ToggleLikeDto {
  @IsString()
  @IsNotEmpty()
  likedUserId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  itemKey!: string;

  @IsBoolean()
  liked!: boolean;
}
