import { Money } from '../../common/types';
import {
  ShiftBreak,
  FullyClassifiedHours,
  CorrectionPaymentTimeframe,
} from '../common/types';

export interface UpdateShiftRequest {
  shiftStartEpochSeconds: number;
  shiftEndEpochSeconds?: number;
  effectiveHourlyPayRate?: Money;
  displayHourlyPayRate?: Money;
  overrideWorkLocationId?: number;
  workersCompClassCode?: string;
  createBreaks?: ShiftBreak[];
  correctionPaymentTimeframe?: CorrectionPaymentTimeframe;
  fullyClassifiedHours?: FullyClassifiedHours[];
  note?: string;
}
