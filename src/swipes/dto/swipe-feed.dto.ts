import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SwipePurpose } from 'generated/prisma';

export class SwipeFeedDto {
  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsEnum(SwipePurpose)
  purpose?: SwipePurpose;
}
