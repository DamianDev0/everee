import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

/**
 * Address DTO
 * Used for home addresses and work locations
 */
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  line1: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  line2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}$/, { message: 'State must be a 2-letter abbreviation' })
  state: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}$/, { message: 'Postal code must be a 5-digit ZIP code' })
  postalCode: string;
}
