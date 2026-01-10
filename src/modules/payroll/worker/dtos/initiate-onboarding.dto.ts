import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { WorkerType } from '../enums/worker.enum';

/**
 * DTO for initiating worker onboarding via Everee
 * Minimal data required - Everee captures the rest via secure web sequence
 */
export class InitiateOnboardingDto {
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

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(11)
  ssn?: string; // Optional - can be collected by Everee

  @IsEnum(WorkerType)
  @IsNotEmpty()
  workerType: WorkerType;

  // External ID for idempotency - should be business logic based
  // Example: 'COMPANY_PROJECT_123_WORKER_456'
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  externalId: string;

  @IsString()
  @IsOptional()
  notes?: string;

 
  @IsOptional()
  hireDate?: string;
}
