import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerDto } from './create-worker.dto';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';
import { WorkerStatus } from '../enums/worker.enum';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {
  @IsEnum(WorkerStatus)
  @IsOptional()
  status?: WorkerStatus;

  @IsDateString()
  @IsOptional()
  terminationDate?: string;

  @IsString()
  @IsOptional()
  terminationReason?: string;
}
