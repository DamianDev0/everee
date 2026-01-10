import { PartialType } from '@nestjs/mapped-types';
import { CreatePayableDto } from './create-payable.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PayableStatus } from '../enums/payable.enum';

export class UpdatePayableDto extends PartialType(CreatePayableDto) {
  @IsEnum(PayableStatus)
  @IsOptional()
  status?: PayableStatus;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsString()
  @IsOptional()
  rejectedBy?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
