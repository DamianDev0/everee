import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * PATCH /api/v2/workers/{workerId}
 * DTO for updating worker information
 */
export class UpdateWorkerDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
