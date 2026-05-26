import { IsArray, IsString } from 'class-validator';

export class UpdateExploringDto {
  @IsArray()
  @IsString({ each: true })
  exploringInterests: string[];
}
