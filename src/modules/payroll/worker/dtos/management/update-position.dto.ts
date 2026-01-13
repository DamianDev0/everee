import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsDateString,
} from 'class-validator';
import { PayType } from '@integrations/everee/interfaces/common/enums';

export class UpdatePositionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(PayType)
  @IsNotEmpty()
  payType: PayType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  payRate: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  expectedWeeklyHours: number;

  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  defaultWorkersCompClassCode?: string;
}
