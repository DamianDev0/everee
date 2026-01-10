export interface EvereeCreatePayableRequest {
  externalId: string;
  workerId: string;
  type: 'contractor_payment' | 'bonus' | 'reimbursement' | 'commission' | 'other';
  amount: number;
  description: string;
  notes?: string;
  scheduledPaymentDate?: string;
  metadata?: Record<string, unknown>;
}

export interface EvereePayableResponse {
  payableId: string;
  externalId: string;
  workerId: string;
  type: 'contractor_payment' | 'bonus' | 'reimbursement' | 'commission' | 'other';
  amount: number;
  description: string;
  notes?: string;
  status: 'pending_approval' | 'approved' | 'processing' | 'paid' | 'failed' | 'rejected';
  scheduledPaymentDate?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReferenceId?: string;
  taxWithholdingApplied: boolean;
  federalTaxWithheld: number;
  stateTaxWithheld: number;
  localTaxWithheld: number;
  netAmount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EvereeApprovePayableRequest {
  approvedBy?: string;
  notes?: string;
}

export interface EvereeRejectPayableRequest {
  rejectedBy?: string;
  rejectionReason: string;
}

export interface EvereeProcessPayablesRequest {
  payableIds: string[];
  processingDate?: string;
}

export interface EvereeProcessPayablesResponse {
  batchId: string;
  processedCount: number;
  failedCount: number;
  totalAmount: number;
  results: Array<{
    payableId: string;
    status: 'processing' | 'paid' | 'failed';
    paymentReferenceId?: string;
    error?: string;
  }>;
  createdAt: string;
}
