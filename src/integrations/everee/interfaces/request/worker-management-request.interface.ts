import { PayType, PaySchedule, AccountType } from '../common/enums';
import { Money } from '../common/types';

export interface UpdatePersonalInfoRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  shirtSize?: string;
  partnerShirtSize?: string;
  dietaryRestrictions?: string;
  preferredName?: string;
}

export interface UpdatePositionRequest {
  title?: string;
  payType: PayType;
  payRate: Money;
  expectedWeeklyHours: number;
  effectiveDate: string;
  defaultWorkersCompClassCode?: string;
}

export interface UpdateBankAccountRequest {
  bankName: string;
  accountName: string;
  accountType: AccountType;
  routingNumber: string;
  accountNumber: string;
}

export interface UpdateLegalWorkLocationRequest {
  useHomeAddress: boolean;
  workLocationId?: number;
  stateUnemploymentTaxLocationId?: number;
  effectiveDate: string;
}

export interface UpdateHomeAddressRequest {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  effectiveDate: string;
}

export interface UpdateWorkerIdRequest {
  id: string;
}

export interface UpdateTaxpayerIdentifierRequest {
  taxpayerIdentifier: string;
}

export interface UpdatePaymentPreferencesRequest {
  preferredPaymentMethod?: 'DIRECT_DEPOSIT' | 'PAY_CARD';
  availablePaymentMethods?: {
    directDeposit?: boolean;
    payCard?: boolean;
  };
  paySchedule?: PaySchedule;
}

export interface UpdateHireDateRequest {
  startDate: string;
}

export interface UpdateEmergencyContactRequest {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  relationship?: string;
}

export interface ListWorkersQuery {
  id?: string[];
  lifecycleStatus?: string[];
  page?: number;
  size?: number;
}

export interface SearchWorkersQuery {
  term: string;
}

export interface GetPayHistoryQuery {
  workerId?: string;
  externalWorkerId?: string;
  page?: number;
  size?: number;
}

export interface GetPayStubsQuery {
  workerId?: string;
  externalWorkerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface GetPayStubDownloadQuery {
  workerId?: string;
  externalWorkerId?: string;
  date: string;
}
