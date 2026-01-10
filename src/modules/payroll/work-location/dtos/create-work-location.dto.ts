import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateWorkLocationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  stateAbbreviation: string; // CRITICAL for tax calculation

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  zipCode: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  country?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  clientName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  clientId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  externalId: string; // Idempotency key

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
