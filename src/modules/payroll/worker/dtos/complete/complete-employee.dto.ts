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
import { AddressDto } from '../common/address.dto';
import { LegalWorkAddressDto } from '../common/legal-work-address.dto';
import { BankAccountDto } from '../common/bank-account.dto';
import { MoneyDto } from '../common/money.dto';
import { WithholdingSettingsDto } from '../common/withholding-settings.dto';
import { PaySchedule, PayType } from '@integrations/everee/interfaces';


/**
 * POST /api/v2/workers/employee
 * DTO for creating a complete employee record with all required data
 * This requires capturing sensitive PII data
 */
export class CreateCompleteEmployeeDto {
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
  @Matches(/^\d{9}$/, { message: 'Taxpayer identifier must be 9 digits (no hyphens)' })
  taxpayerIdentifier: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  homeAddress: AddressDto;

  @ValidateNested()
  @Type(() => LegalWorkAddressDto)
  @IsNotEmpty()
  legalWorkAddress: LegalWorkAddressDto;

  @ValidateNested()
  @Type(() => BankAccountDto)
  @IsNotEmpty()
  bankAccount: BankAccountDto;

  @IsEnum(PayType)
  @IsNotEmpty()
  payType: PayType;

  @ValidateNested()
  @Type(() => MoneyDto)
  @IsNotEmpty()
  payRate: MoneyDto;

  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

  @IsOptional()
  paySchedule?: PaySchedule;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(40)
  typicalWeeklyHours: number;

  @ValidateNested()
  @Type(() => WithholdingSettingsDto)
  @IsNotEmpty()
  withholdingSettings: WithholdingSettingsDto;

  @IsBoolean()
  @IsOptional()
  eligibleForOvertime?: boolean; // defaults to true

  @IsBoolean()
  @IsOptional()
  onboardingComplete?: boolean; // defaults to true

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
