import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  IsNumber,
  IsEnum,
  IsBoolean,
  MaxLength,
  Matches,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LegalWorkAddressDto } from '../common/legal-work-address.dto';
import { MoneyDto } from '../common/money.dto';
import { PaySchedule, PayType } from '@integrations/everee/interfaces';

/**
 * POST /api/v2/onboarding/employee
 * DTO for kicking off employee onboarding with minimal data
 * Everee will capture the rest during the onboarding process
 */
export class OnboardingEmployeeDto {
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

  @IsEnum(PayType)
  @IsNotEmpty()
  payType: PayType;

  @ValidateNested()
  @Type(() => MoneyDto)
  @IsNotEmpty()
  payRate: MoneyDto;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(40)
  typicalWeeklyHours?: number; // defaults to 40

  @IsEnum(PaySchedule)
  @IsOptional()
  paySchedule?: PaySchedule;

  @IsBoolean()
  @IsOptional()
  eligibleForOvertime?: boolean; // defaults to true

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

  @IsNumber()
  @IsOptional()
  timeOffPolicyId?: number;
}
