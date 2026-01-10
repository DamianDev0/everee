export interface EvereeCreateShiftRequest {
  externalId: string;
  workerId: string;
  workLocationId?: string;
  shiftStartTime: string;
  shiftEndTime: string;
  breaks?: {
    type: 'paid' | 'unpaid';
    durationMinutes: number;
  }[];
  effectiveHourlyPayRate?: number;
  workersCompClassCode?: string;
  metadata?: {
    projectName?: string;
    projectId?: string;
    notes?: string;
  };
}

export interface EvereeShiftResponse {
  shiftId: string;
  externalId: string;
  workerId: string;
  workLocationId?: string;
  shiftStartTime: string;
  shiftEndTime: string;
  regularHours: number;
  overtimeHours: number;
  grossPay: number;
  status: 'pending' | 'approved' | 'processed' | 'paid';
  createdAt: string;
}

export interface EvereeUpdateShiftRequest {
  shiftStartTime?: string;
  shiftEndTime?: string;
  breaks?: {
    type: 'paid' | 'unpaid';
    durationMinutes: number;
  }[];
  effectiveHourlyPayRate?: number;
  workersCompClassCode?: string;
}

export interface EvereeShiftCorrectionRequest {
  shiftId: string;
  externalId: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  breaks?: {
    type: 'paid' | 'unpaid';
    durationMinutes: number;
  }[];
  effectiveHourlyPayRate?: number;
  correctionAuthorized: boolean;
  correctionNotes?: string;
  correctionPaymentTimeframe?: 'NEXT_PAYROLL' | 'IMMEDIATELY';
}

export interface EvereeShiftCorrectionResponse {
  correctionId: string;
  originalShiftId: string;
  correctedShiftId?: string;
  correctionType: 'overpayment' | 'underpayment';
  grossPay: number;
  regularHours: number;
  overtimeHours: number;
  status: 'pending' | 'approved' | 'processed';
  createdAt: string;
}
