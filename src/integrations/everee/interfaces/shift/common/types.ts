import { Money } from '../../common/types';

export type CorrectionPaymentTimeframe = 'NEXT_PAYROLL_PAYMENT' | 'IMMEDIATELY' | 'EXTERNALLY_PAID';
export type TaxCalculationConfigCode = 'STANDARD' | 'DIFFICULTY_OF_CARE';

export interface ShiftBreak {
  breakStartEpochSeconds: number;
  breakEndEpochSeconds: number;
}

export interface FullyClassifiedHours {
  classificationCode: string;
  hours: string;
}

export interface ShiftDimensions {
  departmentId?: string;
  projectId?: string;
  costCenterId?: string;
}
