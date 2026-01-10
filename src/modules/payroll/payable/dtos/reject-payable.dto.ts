import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RejectPayableDto {
  @IsUUID()
  @IsNotEmpty()
  payableId: string;

  @IsString()
  @IsNotEmpty()
  rejectedBy: string;

  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}
