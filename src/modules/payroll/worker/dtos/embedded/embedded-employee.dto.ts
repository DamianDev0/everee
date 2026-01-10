import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  IsNumber,
  IsEnum,
  MaxLength,
  Matches,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../common/address.dto';
import { LegalWorkAddressDto } from '../common/legal-work-address.dto';
import { MoneyDto } from '../common/money.dto';
import { PaySchedule, PayType } from '@integrations/everee/interfaces';



/**
 * POST /api/v2/embedded/workers/employee
 * DTO for creating employee for embedded onboarding
 * Worker completes the rest via embedded component
 */
export class CreateEmbeddedEmployeeDto {
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

  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

  @ValidateNested()
  @Type(() => LegalWorkAddressDto)
  @IsNotEmpty()
  legalWorkAddress: LegalWorkAddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  homeAddress: AddressDto;

  @IsString()
  @IsOptional()
  externalWorkerId?: string;

  @IsNumber()
  @IsOptional()
  approvalGroupId?: number;

  @IsNumber()
  @IsOptional()
  timeOffPolicyId?: number;

  @IsEnum(PaySchedule)
  @IsOptional()
  paySchedule?: PaySchedule;
}
