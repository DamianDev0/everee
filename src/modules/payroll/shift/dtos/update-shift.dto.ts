
import { CreateShiftDto } from './create-shift.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ShiftStatus } from '../enums/shift.enum';
import { PartialType } from '@nestjs/swagger';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
