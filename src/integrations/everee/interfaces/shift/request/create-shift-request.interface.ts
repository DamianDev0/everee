import { Money } from '../../common/types';
import {
  ShiftBreak,
  FullyClassifiedHours,
  ShiftDimensions,
  CorrectionPaymentTimeframe,
  TaxCalculationConfigCode,
} from '../common/types';

export interface CreateShiftRequest {
  workerId?: string;
  externalWorkerId?: string;
  shiftStartEpochSeconds: number;
  shiftEndEpochSeconds?: number;
  createBreaks?: ShiftBreak[];
  effectiveHourlyPayRate?: Money;
  displayHourlyPayRate?: Money;
  workLocationId?: number;
  workersCompClassCode?: string;
  taxCalculationConfigCode?: TaxCalculationConfigCode;
  correctionPaymentTimeframe?: CorrectionPaymentTimeframe;
  fullyClassifiedHours?: FullyClassifiedHours[];
  note?: string;
  dimensions?: ShiftDimensions;
}
