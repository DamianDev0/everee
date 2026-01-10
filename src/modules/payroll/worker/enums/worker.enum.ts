export enum WorkerType {
  EMPLOYEE = 'employee', // W-2
  CONTRACTOR = 'contractor', // 1099
}

export enum WorkerStatus {
  PENDING_ONBOARDING = 'pending_onboarding',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
}

export enum OnboardingStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  NOT_STARTED = 'not_started',
}
