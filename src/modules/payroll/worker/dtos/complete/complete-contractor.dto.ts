import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  IsNumber,
  IsBoolean,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../common/address.dto';
import { LegalWorkAddressDto } from '../common/legal-work-address.dto';
import { BankAccountDto } from '../common/bank-account.dto';

/**
 * POST /api/v2/workers/contractor
 * DTO for creating a complete contractor record with all required data
 * This requires capturing sensitive PII data
 */
export class CreateCompleteContractorDto {
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
  @Type(() => AddressDto)
  @IsNotEmpty()
  homeAddress: AddressDto;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{9}$/, { message: 'Taxpayer identifier must be 9 digits (no hyphens)' })
  taxpayerIdentifier: string;

  @ValidateNested()
  @Type(() => BankAccountDto)
  @IsNotEmpty()
  bankAccount: BankAccountDto;

  @ValidateNested()
  @Type(() => LegalWorkAddressDto)
  @IsNotEmpty()
  legalWorkAddress: LegalWorkAddressDto;

  @IsBoolean()
  @IsOptional()
  onboardingComplete?: boolean; // defaults to true

  @IsString()
  @IsOptional()
  externalWorkerId?: string;

  @IsNumber()
  @IsOptional()
  approvalGroupId?: number;
}
