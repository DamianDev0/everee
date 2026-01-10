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
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BreakType } from '../enums/shift.enum';

export class ShiftBreakDto {
  @IsEnum(BreakType)
  @IsNotEmpty()
  type: BreakType;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  durationMinutes: number;
}

export class CreateShiftDto {
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @IsUUID()
  @IsOptional()
  workLocationId?: string; // CRITICAL for staffing industry

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
  effectiveHourlyPayRate?: number; // Override default rate for this shift

  @IsString()
  @IsOptional()
  @MaxLength(20)
  workersCompClassCode?: string; // e.g., '3220'

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  externalId: string; // Idempotency key - must be deterministic

  @IsString()
  @IsOptional()
  @MaxLength(255)
  projectName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  projectId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Correction fields
  @IsBoolean()
  @IsOptional()
  isCorrection?: boolean;

  @IsUUID()
  @IsOptional()
  originalShiftId?: string;

  @IsBoolean()
  @IsOptional()
  correctionAuthorized?: boolean;

  @IsString()
  @IsOptional()
  correctionNotes?: string;
}
