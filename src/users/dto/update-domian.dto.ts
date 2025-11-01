import { IsString } from "class-validator";

export class UpdateDomainDto {
  @IsString()
  domain: string; // example: "Tech", "Design", "Product"
}
