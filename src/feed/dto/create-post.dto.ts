import { IsBoolean, IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { PostType } from 'generated/prisma';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(PostType)
  type: PostType; // "PRODUCT" | "PROJECT"

  @IsArray()
  @IsOptional()
  contributorIds?: string[];

  @IsBoolean()
  @IsOptional()
  allowJoinTeam?: boolean;
}
