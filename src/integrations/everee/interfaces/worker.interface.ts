export interface EvereeCreateWorkerRequest {
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  workerType: 'employee' | 'contractor';
  ssn?: string;
  phoneNumber?: string;
}

export interface EvereeCreateWorkerResponse {
  workerId: string;
  externalWorkerId: string;
  userId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  statutoryEmployee: boolean;
  position: {
    scheduledChangeValidation: {
      earliestEffectiveDate: string;
      effectiveDateRequired: boolean;
    };
  };
  homeAddress: {
    scheduledChangeValidation: {
      earliestEffectiveDate: string;
      effectiveDateRequired: boolean;
    };
  };
  bankAccounts: any[];
  approvalGroup: Record<string, any>;
  legalWorkAddress: {
    current: {
      id: number;
      createdAt: string;
      updatedAt: string;
      companyId: number;
      employeeId: number;
      startDate: string;
      name: string;
      homeAddress: boolean;
      stateUnemploymentTaxLocationOverridden: boolean;
      active: boolean;
      upcoming: boolean;
      ended: boolean;
      currentPhase: string;
    };
    scheduledChangeValidation: {
      earliestEffectiveDate: string;
      effectiveDateRequired: boolean;
    };
  };
  onboardingComplete: boolean;
  hireDate: string;
  employmentType: 'CONTRACTOR' | 'EMPLOYEE';
  payPeriodPreferenceOptions: Array<{
    type: 'WEEKLY' | 'DAILY';
    permittedToSelect: boolean;
    selected: boolean;
    current: boolean;
    localizedDescription: string;
    localizedTitle: string;
  }>;
  directReportsCount: number;
  lifecycleStatus: 'ONBOARDING' | string;
  onboardingStatus: 'NOT_STARTED' | string;
  accountAccessPermitted: boolean;
  supportedPaymentTypes: string[];
  tinVerificationStatus: 'UNABLE_TO_VERIFY' | string;
  preferredPaymentMethod: 'DIRECT_DEPOSIT' | string;
  availablePaymentMethods: {
    directDeposit: boolean;
    payCard: boolean;
  };
  workerIntegrationIds: Array<{
    id: number;
    type: string;
    displayName: string;
    integrationId: string;
  }>;
  fullName: string;
  displayFullName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvereeWorkerResponse extends EvereeCreateWorkerResponse {}

export interface EvereeUpdateWorkerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface EvereeTerminateWorkerRequest {
  terminationDate: string;
  terminationReason?: string;
}

export interface EvereeCreateComponentSessionRequest {
  workerId?: string;
  externalWorkerId?: string;
  eventHandlerName: string;
  experience: 'ONBOARDING';
  experienceVersion: 'V2_0';
  experienceOptions?: {
    accountSetupEnabled?: boolean;
    brandingEnabled?: boolean;
    onboardingBackButtonEnabled?: boolean;
  };
}

export interface EvereeCreateComponentSessionResponse {
  url: string;
  origin: string;
  expiresInMs: number;
  experience: 'ONBOARDING';
  experienceVersion: 'V2_0';
  embeddedOnboardingExperienceType: 'FULL' | 'LIGHT' | string;
  experienceOptions: {
    accountSetupEnabled: boolean;
    brandingEnabled: boolean;
    onboardingBackButtonEnabled: boolean;
  };
  hideEvereeBranding: boolean;
}
