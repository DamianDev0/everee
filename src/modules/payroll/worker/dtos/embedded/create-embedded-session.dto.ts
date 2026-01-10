import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmbeddedExperience, EmbeddedExperienceVersion } from '@integrations/everee/interfaces';



class EmbeddedExperienceOptionsDto {
  @IsBoolean()
  @IsOptional()
  accountSetupEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  brandingEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  onboardingBackButtonEnabled?: boolean;
}

/**
 * POST /api/v2/embedded/session
 * DTO for creating an embedded component session
 * Sessions expire quickly - create immediately before use
 */
export class CreateEmbeddedSessionDto {
  @IsString()
  @IsOptional()
  workerId?: string; // required if externalWorkerId is null

  @IsString()
  @IsOptional()
  externalWorkerId?: string; // required if workerId is null

  @IsString()
  @IsNotEmpty()
  eventHandlerName: string;

  @IsEnum(EmbeddedExperience)
  @IsNotEmpty()
  experience: EmbeddedExperience;

  @IsEnum(EmbeddedExperienceVersion)
  @IsNotEmpty()
  experienceVersion: EmbeddedExperienceVersion;

  @ValidateNested()
  @Type(() => EmbeddedExperienceOptionsDto)
  @IsOptional()
  experienceOptions?: EmbeddedExperienceOptionsDto;
}
