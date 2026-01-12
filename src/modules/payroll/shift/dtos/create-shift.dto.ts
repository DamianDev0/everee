import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  MaxLength,
  Min,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShiftBreakDto {
  @IsIn(['paid', 'unpaid'])
  @IsNotEmpty()
  type: 'paid' | 'unpaid';

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}

export class CreateShiftDto {
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @IsString()
  @IsNotEmpty()
  externalWorkerId: string;

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

  @IsNumber()
  @IsOptional()
  workLocationId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  workersCompClassCode?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  correctionAuthorized?: boolean;
}
