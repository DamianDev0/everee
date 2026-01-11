import { Money } from '../../common/types';
import { GetWorkerResponse } from './worker-response.interface';

export interface WorkerListItem {
  workerId: string;
  externalWorkerId?: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  totalItems: number;
  sortOrders?: any[];
}

export interface SearchWorkersResponse {
  items: WorkerListItem[];
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  totalItems: number;
  sortOrders?: any[];
}

export interface OnboardingAccessDetailsResponse {
  onboardingUrl: string;
}

export interface LeaveBalance {
  policyId: string;
  title: string;
  currentBalance: string;
  earningType?: string;
}

export interface PaymentHistoryItem {
  workerId: string;
  workerFullName: string;
  paymentId: number;
  payStubDate: string;
  payDate: string;
  grossEarnings: Money;
  totalTaxesWithheld: Money;
  preTaxDeductions: Money;
  postTaxDeductions: Money;
  deferredCompensation: Money;
  netEarnings: Money;
  payableNotes?: string[];
  taxesWithheld?: Array<{
    amount: Money;
    amountYearToDate: Money;
    name: string;
  }>;
  deductions?: any[];
  deposits?: Array<{
    destinationLabel: string;
    amount: Money;
  }>;
}

export interface PayStub {
  id: number;
  workerId: string;
  externalWorkerId?: string;
  date: string;
  payPeriodStartDate: string;
  payPeriodEndDate: string;
  grossEarnings: Money;
  ytdGrossEarnings: Money;
  totalTaxesEe: Money;
  preTaxDeductions: Money;
  ytdPreTaxDeductions: Money;
  postTaxDeductions: Money;
  ytdPostTaxDeductions: Money;
  deferredCompensation: Money;
  ytdDeferredCompensation: Money;
  netEarnings: Money;
  ytdNetEarnings: Money;
}

export interface PayStubDownloadResponse {
  url: string;
  expiresAt: number;
}
