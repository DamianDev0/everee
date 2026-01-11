export enum WebhookEventType {
  WORKER_ONBOARDING_COMPLETED = 'worker.onboarding-completed',
  PAYMENT_UPDATED_PAYMENT_METHOD = 'payment.updated-payment-method',
  WORKER_NEW_TAX_FORMS_AVAILABLE = 'worker.new-tax-forms-available',
  PAYMENT_PAID = 'payment.paid',
  PAYMENT_PAYABLES_STATUS_CHANGED = 'payment-payables.status-changed',
  PAYMENT_DEPOSIT_RETURNED = 'payment.deposit-returned',
  WORKER_CREATED = 'worker.created',
  WORKER_PROFILE_UPDATED = 'worker.profile-updated',
  WORKER_DELETED = 'worker.deleted',
  WORKER_ONBOARDING_LOCKED = 'worker.onboarding-locked',
  WORKER_TIN_VERIFICATION_STATUS_CHANGED = 'worker.tin-verification-status-changed',
}

export interface WebhookPayloadEnvelope<T = any> {
  version: string;
  id: string;
  companyId: number;
  type: WebhookEventType;
  timestamp: number;
  data: {
    object: T;
  };
}

export interface WorkerOnboardingCompletedData {
  workerId: string;
  externalWorkerId: string;
  onboardingStatus: 'COMPLETE';
  onboardingComplete: true;
}

export interface PaymentMethodUpdatedData {
  workerId: string;
  externalWorkerId: string;
  directDeposit: boolean;
  payCard: boolean;
}

export interface NewTaxFormsAvailableData {
  workerId: string;
  externalWorkerId: string;
}

export interface PaymentPaidData {
  workerId: string;
  externalWorkerId: string;
  paymentId: number;
  earningDate: string;
  grossAmount: {
    amount: string;
    currency: string;
  };
  netAmount: {
    amount: string;
    currency: string;
  };
}

export interface PaymentPayablesStatusChangedData {
  workerId: string;
  externalWorkerId: string;
  paymentId: number;
  earningDate: string;
  payableExternalIds: string[];
  paymentStatus: 'PAID' | 'ERROR';
  paymentErrorMessage?: string;
}

export interface PaymentDepositReturnedData {
  workerId: string;
  externalWorkerId: string;
  paymentId: number;
}

export interface WorkerCreatedData {
  workerId: string;
  externalWorkerId: string;
}

export interface WorkerProfileUpdatedData {
  workerId: string;
  externalWorkerId: string;
}

export interface WorkerDeletedData {
  workerId: string;
  externalWorkerId: string;
}

export interface WorkerOnboardingLockedData {
  workerId: string;
  externalWorkerId: string;
  onboardingLockedAt: string;
  onboardingLocked: true;
}

export interface WorkerTinVerificationStatusChangedData {
  workerId: string;
  externalWorkerId: string;
  tinVerificationStatus: 'VERIFICATION_SUCCESS' | 'VERIFICATION_FAILED';
}
