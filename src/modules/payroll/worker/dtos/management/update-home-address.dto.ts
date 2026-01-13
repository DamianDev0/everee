import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class UpdateHomeAddressDto {
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
  @MaxLength(2)
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  postalCode: string;

  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string;
}
