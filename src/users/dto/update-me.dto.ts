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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const GENDERS = ['male', 'female', 'non-binary', 'prefer-not-to-say'] as const;

export class ShowcaseItemDto {
  @IsString() @MinLength(1) @MaxLength(120)
  title: string;

  @IsString() @MaxLength(60)
  type: string;

  @IsOptional() @IsString() @MaxLength(400)
  description?: string;

  @IsOptional() @IsString() @MaxLength(300)
  link?: string;
}

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
  // Free-text; common values are 'student' | 'professional' | 'freelancer' | 'other'
  // but users can supply a custom label via the onboarding "Other" option.
  @IsOptional() @IsString() @MinLength(1) @MaxLength(60)
  personType?: string;

  @IsOptional() @IsString() @MaxLength(80)
  domain?: string;

  @IsOptional() @IsString() @MaxLength(120)
  role?: string;

  // Current company (typically for working professionals).
  @IsOptional() @IsString() @MaxLength(120)
  company?: string;

  // College/university name (e.g. "IIT Bombay").
  @IsOptional() @IsString() @MaxLength(120)
  college?: string;

  // Course/degree (e.g. "B.Tech").
  @IsOptional() @IsString() @MaxLength(120)
  course?: string;

  // Exam/goal an Aspirant is preparing for (e.g. UPSC, GATE, NEET PG).
  @IsOptional() @IsString() @MaxLength(120)
  aspirantOf?: string;

  // Showcase: things the user has built/done.
  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ShowcaseItemDto)
  showcase?: ShowcaseItemDto[];

  @IsOptional() @IsInt() @Min(0)
  experience?: number;

  @IsOptional() @IsInt() @Min(0)
  practiceYears?: number;

  // Step 4 — Skills
  @IsOptional() @IsArray() @ArrayMaxSize(40) @IsString({ each: true })
  skills?: string[];

  // Step 5 — Interests
  @IsOptional() @IsArray() @ArrayMaxSize(40) @IsString({ each: true })
  interests?: string[];

  // Step 6 — Find me for
  @IsOptional() @IsArray() @ArrayMaxSize(40) @IsString({ each: true })
  findMeFor?: string[];

  // Step 7 — Goals
  @IsOptional() @IsArray() @ArrayMaxSize(15) @IsString({ each: true })
  goals?: string[];

  // Step 8 — Currently working on
  @IsOptional() @IsString() @MaxLength(280)
  currentlyWorkingOn?: string;
}
