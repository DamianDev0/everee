import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  IsNumber,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LegalWorkAddressDto } from '../common/legal-work-address.dto';

/**
 * POST /api/v2/onboarding/contractor
 * DTO for kicking off contractor onboarding with minimal data
 * Everee will capture the rest during the onboarding process
 */
export class OnboardingContractorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

  @ValidateNested()
  @Type(() => LegalWorkAddressDto)
  @IsNotEmpty()
  legalWorkAddress: LegalWorkAddressDto;

  @IsString()
  @IsOptional()
  externalWorkerId?: string;

  @IsNumber()
  @IsOptional()
  approvalGroupId?: number;
}
