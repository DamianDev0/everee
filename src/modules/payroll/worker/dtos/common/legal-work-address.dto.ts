import { IsBoolean, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

/**
 * Legal Work Address DTO
 * Specifies where the worker legally performs work
 */
export class LegalWorkAddressDto {
  @IsBoolean()
  @IsNotEmpty()
  useHomeAddress: boolean;

  @IsNumber()
  @IsOptional()
  workLocationId?: number;
}
