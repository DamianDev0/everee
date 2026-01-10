import {
  IsBoolean,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MoneyDto } from './money.dto';
import { MaritalStatus } from '@integrations/everee/interfaces';



/**
 * Withholding Settings DTO
 * Corresponds to IRS Form W-4 (2020+)
 * Required for employees (W-2)
 */
export class WithholdingSettingsDto {
  @IsBoolean()
  @IsOptional()
  haveExactlyTwoJobs?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  countOfChildren?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  countOfOtherDependents?: number;

  @ValidateNested()
  @Type(() => MoneyDto)
  @IsOptional()
  otherIncomeAnnually?: MoneyDto;

  @ValidateNested()
  @Type(() => MoneyDto)
  @IsOptional()
  deductionsAnnually?: MoneyDto;

  @ValidateNested()
  @Type(() => MoneyDto)
  @IsOptional()
  extraWithholdingsMonthly?: MoneyDto;

  @IsBoolean()
  @IsOptional()
  exempt?: boolean;

  @IsEnum(MaritalStatus)
  @IsNotEmpty()
  maritalStatus: MaritalStatus;
}
