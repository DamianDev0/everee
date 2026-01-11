import { Money } from '../../common/types';

export interface PunchTime {
  effectivePunchAt: string;
}

export interface ShiftBreakResponse {
  segmentId: number;
  segmentConfigCode: string;
  segmentConfigTitle: string;
  breakStartAt: PunchTime;
  breakEndAt: PunchTime;
  segmentDuration: string;
}

export interface ClassifiedTime {
  totalDuration: string;
  totalPayableAmount: Money;
}

export interface ShiftDurations {
  shiftDuration: string;
  paidBreakDuration: string;
  unpaidBreakDuration: string;
  regularTimeWorked: ClassifiedTime;
  overtimeWorked: ClassifiedTime;
  doubleTimeWorked: ClassifiedTime;
}

export interface PayableDetails {
  totalPayableAmount: Money;
  paid: boolean;
}

export interface ShiftResponse {
  workerId: string;
  workedShiftId: number;
  legalWorkTimeZone: string;
  shiftStartAt: PunchTime;
  shiftEndAt: PunchTime;
  verifiedAt?: string;
  verifiedByUserId?: number;
  effectivePayRate: Money;
  payRateOverridden: boolean;
  payableDetails: PayableDetails;
  shiftBreaks: ShiftBreakResponse[];
  shiftDurations: ShiftDurations;
}
