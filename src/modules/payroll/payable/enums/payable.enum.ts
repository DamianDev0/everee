export enum PayableType {
  CONTRACTOR_PAYMENT = 'contractor_payment',
  BONUS = 'bonus',
  REIMBURSEMENT = 'reimbursement',
  COMMISSION = 'commission',
  OTHER = 'other',
}

export enum PayableStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum CorrectionPaymentTimeframe {
  NEXT_PAYROLL = 'NEXT_PAYROLL',
  IMMEDIATELY = 'IMMEDIATELY',
}
