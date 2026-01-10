import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { PayableType } from '../enums/payable.enum';

export class CreatePayableDto {
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @IsEnum(PayableType)
  @IsNotEmpty()
  type: PayableType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  externalId: string; // Idempotency key - e.g., 'PROJECT_123_CONTRACTOR_456'

  @IsString()
  @IsOptional()
  @MaxLength(100)
  projectId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  projectName?: string;

  @IsDateString()
  @IsOptional()
  scheduledPaymentDate?: string;
}
