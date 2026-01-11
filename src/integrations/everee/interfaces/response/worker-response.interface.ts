/**
 * Everee Workers API - Response Interfaces
 * All response payloads for worker-related endpoints
 */

import {
  WorkerType,
  LifecycleStatus,
  OnboardingStatus,
} from '../common/enums';
import {
  PositionResponse,
  HomeAddressResponse,
  LegalWorkAddressResponse,
  BankAccountResponse,
  WithholdingSettingsResponse,
  ApprovalGroup,
  Team,
  PayPeriodPreferenceOption,
  WorkerIntegrationId,
  AvailablePaymentMethods,
} from '../common/types';

/**
 * Base Worker Response
 * Contains common fields returned by all worker endpoints
 */
export interface BaseWorkerResponse {
  workerId: string;
  externalWorkerId?: string;
  userId?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string; // 10 digits
  email: string;
  position?: PositionResponse;
  hireDate: string; // ISO8601 date
  legalWorkAddress: LegalWorkAddressResponse;
  approvalGroup?: ApprovalGroup;
  team?: Team;
  lifecycleStatus?: LifecycleStatus;
  onboardingStatus?: OnboardingStatus;
  onboardingComplete?: boolean;
  employmentType?: WorkerType;
  fullName?: string;
  displayFullName?: string;
}

/**
 * Extended Worker Response
 * Includes additional fields for complete worker records
 */
export interface ExtendedWorkerResponse extends BaseWorkerResponse {
  userId?: number;
  onboardingComplete: boolean;
  homeAddress: HomeAddressResponse;
  dateOfBirth?: string; // ISO8601 date
  taxpayerIdentifier?: string; // 10 digits (with formatting)
  typicalWeeklyHours?: number; // 1-40 inclusive
  bankAccounts: BankAccountResponse[];
  withholdingSettings?: WithholdingSettingsResponse; // Only for employees
  statutoryEmployee?: boolean;
  employmentType: WorkerType;
  payPeriodPreferenceOptions?: PayPeriodPreferenceOption[];
  directReportsCount?: number;
  lifecycleStatus: LifecycleStatus;
  onboardingStatus: OnboardingStatus;
  accountAccessPermitted?: boolean;
  supportedPaymentTypes?: string[];
  tinVerificationStatus?: string;
  preferredPaymentMethod?: string;
  availablePaymentMethods?: AvailablePaymentMethods;
  workerIntegrationIds?: WorkerIntegrationId[];
  fullName: string;
  displayFullName: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ==========================================
 * ONBOARDING ENDPOINTS RESPONSES
 * ==========================================
 */

/**
 * POST /api/v2/onboarding/contractor
 * Response from contractor onboarding kickoff
 */
export interface OnboardingContractorResponse extends BaseWorkerResponse {
  // Inherits all fields from BaseWorkerResponse
}

/**
 * POST /api/v2/onboarding/employee
 * Response from employee onboarding kickoff
 */
export interface OnboardingEmployeeResponse extends BaseWorkerResponse {
  // Inherits all fields from BaseWorkerResponse
}

/**
 * ==========================================
 * COMPLETE WORKER ENDPOINTS RESPONSES
 * ==========================================
 */

/**
 * POST /api/v2/workers/contractor
 * Response from creating a complete contractor record
 */
export interface CreateCompleteContractorResponse extends ExtendedWorkerResponse {
  employmentType: WorkerType.CONTRACTOR;
}

/**
 * POST /api/v2/workers/employee
 * Response from creating a complete employee record
 */
export interface CreateCompleteEmployeeResponse extends ExtendedWorkerResponse {
  employmentType: WorkerType.EMPLOYEE;
  withholdingSettings: WithholdingSettingsResponse; // Required for employees
}

/**
 * ==========================================
 * EMBEDDED COMPONENTS ENDPOINTS RESPONSES
 * ==========================================
 */

/**
 * POST /api/v2/embedded/workers/contractor
 * Response from creating contractor for embedded onboarding
 */
export interface EmbeddedContractorResponse {
  workerId: string;
  externalWorkerId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  startDate: string;
  homeAddress: HomeAddressResponse;
  approvalGroup?: ApprovalGroup;
  onboardingComplete: boolean;
  lifecycleStatus: LifecycleStatus;
  onboardingStatus: OnboardingStatus;
}

/**
 * POST /api/v2/embedded/workers/employee
 * Response from creating employee for embedded onboarding
 */
export interface EmbeddedEmployeeResponse {
  workerId: string;
  externalWorkerId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  position: PositionResponse;
  hireDate: string;
  homeAddress: HomeAddressResponse;
  legalWorkAddress: LegalWorkAddressResponse;
  approvalGroup?: ApprovalGroup;
  onboardingComplete: boolean;
  lifecycleStatus: LifecycleStatus;
  onboardingStatus: OnboardingStatus;
  typicalWeeklyHours?: number;
}

/**
 * ==========================================
 * WORKER MANAGEMENT ENDPOINTS RESPONSES
 * ==========================================
 */

/**
 * GET /api/v2/workers/{workerId}
 * Response from getting a single worker
 */
export interface GetWorkerResponse extends ExtendedWorkerResponse {
  // Inherits all fields from ExtendedWorkerResponse
}

/**
 * DELETE /api/v2/workers/{workerId}
 * Response from deleting a worker (usually 204 No Content, so no body)
 */
export interface DeleteWorkerResponse {
  // Empty response or success message
  success?: boolean;
  message?: string;
}

/**
 * PATCH /api/v2/workers/{workerId}
 * Response from updating a worker
 */
export interface UpdateWorkerResponse extends ExtendedWorkerResponse {
  // Inherits all fields from ExtendedWorkerResponse
}

/**
 * POST /api/v2/workers/{workerId}/terminate
 * Response from terminating a worker
 */
export interface TerminateWorkerResponse {
  workerId: string;
  terminationDate: string;
  lifecycleStatus: LifecycleStatus.TERMINATED;
  success: boolean;
}
