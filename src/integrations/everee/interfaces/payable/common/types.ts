import { Money } from '../../common/types';

export type PayableModel = 'PRE_CALCULATED';

export type EarningType =
  | 'ADVANCE'
  | 'BONUS'
  | 'COMMISSION'
  | 'DOUBLE_TIME_HOURLY'
  | 'EMERGENCY_FFCRA_SICK'
  | 'EMERGENCY_FFCRA_FMLA'
  | 'HOLIDAY'
  | 'ADDITIONAL_HOLIDAY'
  | 'ISO_DISQUALIFYING_DISPOSITION'
  | 'ISO_QUALIFYING_DISPOSITION'
  | 'LOAN'
  | 'OVERTIME_HOURLY'
  | 'NSO'
  | 'PER_DIEM'
  | 'PTO'
  | 'REGULAR_HOURLY'
  | 'REGULAR_SALARY'
  | 'CONTRACTOR'
  | 'REIMBURSEMENT'
  | 'RSU'
  | 'SEPARATION'
  | 'SICK'
  | 'TIPS'
  | 'VACATION';

export type PaymentStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'CANCELLED';

export interface UnitRate {
  amount: string;
  currency: string;
}
