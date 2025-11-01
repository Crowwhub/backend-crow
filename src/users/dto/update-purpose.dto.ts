import { IsString } from "class-validator";

export class UpdatePurposeDto {
  @IsString()
  purpose: string; // example: "Networking", "Hiring", "Project Partner"
}

