import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const GENDERS = ['male', 'female', 'non-binary', 'prefer-not-to-say'] as const;
const TYPES = ['student', 'professional', 'freelancer'] as const;

export class UpdateMeDto {
  // Step 1 — Profile
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80)
  name?: string;

  @IsOptional() @IsString() @MaxLength(64)
  avatar?: string;

  // Step 2 — Personal
  @IsOptional() @IsDateString()
  birthday?: string;

  @IsOptional() @IsString() @IsIn([...GENDERS])
  gender?: (typeof GENDERS)[number];

  @IsOptional() @IsString() @MaxLength(120)
  location?: string;

  // Step 3 — Role / Work
  @IsOptional() @IsString() @IsIn([...TYPES])
  personType?: (typeof TYPES)[number];

  @IsOptional() @IsString() @MaxLength(80)
  domain?: string;

  @IsOptional() @IsString() @MaxLength(120)
  role?: string;

  @IsOptional() @IsInt() @Min(0)
  experience?: number;

  @IsOptional() @IsInt() @Min(0)
  practiceYears?: number;

  // Step 4 — Skills
  @IsOptional() @IsArray() @ArrayMaxSize(40) @IsString({ each: true })
  skills?: string[];

  // Step 5 — Purpose (ordered)
  @IsOptional() @IsArray() @ArrayMaxSize(8) @IsString({ each: true })
  purpose?: string[];

  // Step 6 — Interests
  @IsOptional() @IsArray() @ArrayMaxSize(40) @IsString({ each: true })
  interests?: string[];

  // Step 7 — Find me for
  @IsOptional() @IsArray() @ArrayMaxSize(40) @IsString({ each: true })
  findMeFor?: string[];

  // Step 8 — Goals
  @IsOptional() @IsArray() @ArrayMaxSize(15) @IsString({ each: true })
  goals?: string[];

  // Step 9 — Currently working on
  @IsOptional() @IsString() @MaxLength(280)
  currentlyWorkingOn?: string;
}
