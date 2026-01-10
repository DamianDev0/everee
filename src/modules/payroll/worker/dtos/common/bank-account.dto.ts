import {
  IsString,
  IsNotEmpty,
  IsEnum,
  Matches,
  MaxLength,
} from 'class-validator';

enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
}

/**
 * Bank Account DTO
 * For capturing bank account information
 */
export class BankAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bankName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  accountName: string;

  @IsEnum(AccountType)
  @IsNotEmpty()
  accountType: AccountType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{9}$/, { message: 'Routing number must be 9 digits' })
  routingNumber: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}
