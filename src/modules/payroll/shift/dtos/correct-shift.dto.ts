import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftBreakDto } from './create-shift.dto';
import { CorrectionPaymentTimeframe } from '@modules/payroll/payable/enums/payable.enum';

/**
 * DTO for correcting shift hours after pay period has been finalized
 * Requires explicit authorization to prevent accidental corrections
 */
export class CorrectShiftDto {
  @IsUUID()
  @IsNotEmpty()
  originalShiftId: string; // Reference to the shift being corrected

  @IsDateString()
  @IsNotEmpty()
  shiftStartTime: string;

  @IsDateString()
  @IsNotEmpty()
  shiftEndTime: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftBreakDto)
  @IsOptional()
  breaks?: ShiftBreakDto[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  effectiveHourlyPayRate?: number;

  @IsBoolean()
  @IsNotEmpty()
  correctionAuthorized: boolean; // Must be true or API will reject

  @IsString()
  @IsNotEmpty()
  correctionNotes: string; // Required explanation for the correction

  @IsEnum(CorrectionPaymentTimeframe)
  @IsOptional()
  correctionPaymentTimeframe?: CorrectionPaymentTimeframe; // NEXT_PAYROLL or IMMEDIATELY

  @IsString()
  @IsNotEmpty()
  externalId: string; // New external ID for the correction shift
}
