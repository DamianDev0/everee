import { Money } from '../../common/types';
import {
  ShiftDimensions,
  CorrectionPaymentTimeframe,
} from '../common/types';

export interface ClassifiedHoursPerWorker {
  workerId?: string;
  externalWorkerId?: string;
  payRate: Money;
  regularHoursWorked?: string;
  overtimeHoursWorked?: string;
  doubleTimeHoursWorked?: string;
  workLocationId?: number;
  workersCompClassCode?: string;
  dimensions?: ShiftDimensions;
}

export interface BulkClassifiedHoursRequest {
  earningDate: string;
  classifiedHoursPerWorker: ClassifiedHoursPerWorker[];
  correctionPaymentTimeframe?: CorrectionPaymentTimeframe;
}
