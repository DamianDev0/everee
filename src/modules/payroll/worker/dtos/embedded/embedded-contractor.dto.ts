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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../common/address.dto';

enum PayeeType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

/**
 * POST /api/v2/embedded/workers/contractor
 * DTO for creating contractor for embedded onboarding
 * Worker completes the rest via embedded component
 */
export class CreateEmbeddedContractorDto {
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
  startDate: string;

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

  @IsEnum(PayeeType)
  @IsOptional()
  payeeType?: PayeeType; // defaults to INDIVIDUAL
}
