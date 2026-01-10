import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

/**
 * Money DTO
 * Represents monetary amounts
 */
export class MoneyDto {
  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;
}
