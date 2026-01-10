import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ApprovePayableDto {
  @IsUUID()
  @IsNotEmpty()
  payableId: string;

  @IsString()
  @IsNotEmpty()
  approvedBy: string;
}
