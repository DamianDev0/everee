/**
 * Everee API Common Types
 * Shared types and objects used across different Everee API endpoints
 */

import { StateAbbreviation, AccountType, MaritalStatus } from './enums';

/**
 * Money object representation
 * Represents monetary amounts in Everee API
 */
export interface Money {
  currency: string;
  amount?: number;
}

/**
 * Address object
 * Used for home addresses and work locations
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: StateAbbreviation | string;
  postalCode: string; // 5-digit ZIP code
}

/**
 * Legal Work Address object for requests
 * Specifies where the worker legally performs work
 */
export interface LegalWorkAddressRequest {
  useHomeAddress: boolean;
  workLocationId?: number;
}

/**
 * Legal Work Address - Current state (in responses)
 */
export interface LegalWorkAddressCurrent {
  useHomeAddress: boolean;
  name?: string;
  workLocationId?: number;
  address?: Address;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  companyId?: number;
  employeeId?: number;
  startDate?: string;
  homeAddress?: boolean;
  stateUnemploymentTaxLocationOverridden?: boolean;
  active?: boolean;
  upcoming?: boolean;
  ended?: boolean;
  currentPhase?: string;
}

/**
 * Legal Work Address object for responses
 */
export interface LegalWorkAddressResponse {
  current: LegalWorkAddressCurrent;
  scheduledChangeValidation?: ScheduledChangeValidation;
}

/**
 * Home Address object for requests
 */
export interface HomeAddressRequest extends Address {}

/**
 * Home Address - Current state (in responses)
 */
export interface HomeAddressCurrent extends Address {}

/**
 * Home Address object for responses
 */
export interface HomeAddressResponse {
  current: HomeAddressCurrent;
  scheduledChangeValidation?: ScheduledChangeValidation;
}

/**
 * Bank Account information for requests
 */
export interface BankAccountRequest {
  bankName: string;
  accountName: string;
  accountType: AccountType;
  routingNumber: string; // 9 digits
  accountNumber: string;
}

/**
 * Bank Account information for responses
 */
export interface BankAccountResponse {
  bankName: string;
  accountName: string;
  accountType: AccountType;
  routingNumber: string; // 9 digits
  accountNumberLast4: string; // Only last 4 digits returned
}

/**
 * Withholding Settings for W-4 (employees)
 * Corresponds to 2020+ IRS Form W-4
 */
export interface WithholdingSettingsRequest {
  haveExactlyTwoJobs?: boolean;
  countOfChildren?: number;
  countOfOtherDependents?: number;
  otherIncomeAnnually?: Money;
  deductionsAnnually?: Money;
  extraWithholdingsMonthly?: Money;
  exempt?: boolean;
  maritalStatus: MaritalStatus;
}

/**
 * Withholding Settings - Current state (in responses)
 */
export interface WithholdingSettingsCurrent {
  haveExactlyTwoJobs: boolean;
  countOfChildren: number;
  countOfOtherDependents: number;
  otherIncomeAnnually: Money;
  deductionsAnnually: Money;
  extraWithholdingsMonthly: Money;
  exempt: boolean;
  maritalStatus: MaritalStatus;
}

/**
 * Withholding Settings object for responses
 */
export interface WithholdingSettingsResponse {
  current: WithholdingSettingsCurrent;
  scheduledChangeValidation?: ScheduledChangeValidation;
}

/**
 * Position information - Current state
 */
export interface PositionCurrent {
  payType: string;
  payRate: Money;
  title?: string;
}

/**
 * Position object for responses
 */
export interface PositionResponse {
  current: PositionCurrent;
  scheduledChangeValidation?: ScheduledChangeValidation;
}

/**
 * Approval Group information
 */
export interface ApprovalGroup {
  id: number;
  name: string;
}

/**
 * Team information
 */
export interface Team {
  id: number;
  name: string;
}

/**
 * Scheduled Change Validation metadata
 */
export interface ScheduledChangeValidation {
  earliestEffectiveDate: string;
  effectiveDateRequired: boolean;
}

/**
 * Pay Period Preference Options
 */
export interface PayPeriodPreferenceOption {
  type: 'WEEKLY' | 'DAILY' | 'BI_WEEKLY' | 'SEMI_MONTHLY';
  permittedToSelect: boolean;
  selected: boolean;
  current: boolean;
  localizedDescription: string;
  localizedTitle: string;
}

/**
 * Worker Integration IDs
 */
export interface WorkerIntegrationId {
  id: number;
  type: string;
  displayName: string;
  integrationId: string;
}

/**
 * Available Payment Methods
 */
export interface AvailablePaymentMethods {
  directDeposit: boolean;
  payCard: boolean;
}
