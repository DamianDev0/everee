import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsPhoneNumber,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { WorkerType } from '../enums/worker.enum';

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('US')
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(WorkerType)
  @IsNotEmpty()
  workerType: WorkerType;

  // For employees (W-2)
  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(11)
  ssn?: string;

  // For contractors (1099)
  @IsString()
  @IsOptional()
  @MaxLength(20)
  ein?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  businessName?: string;

  // Address Information
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  zipCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  country?: string;

  // Employment Information
  @IsNumber()
  @IsOptional()
  defaultHourlyRate?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  position?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  defaultWorkersCompClassCode?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  externalId: string;
}
