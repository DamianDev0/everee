import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

/**
 * POST /api/v2/workers/{workerId}/terminate
 * DTO for terminating a worker
 */
export class TerminateWorkerDto {
  @IsDateString()
  @IsNotEmpty()
  terminationDate: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  terminationReason?: string;
}
