/**
 * Everee Workers API - Request Interfaces
 * All request payloads for worker-related endpoints
 */

import {
  PayType,
  PaySchedule,
  PayeeType,
} from '../common/enums';
import {
  Money,
  HomeAddressRequest,
  LegalWorkAddressRequest,
  BankAccountRequest,
  WithholdingSettingsRequest,
} from '../common/types';

/**
 * ==========================================
 * ONBOARDING ENDPOINTS (Minimal Data)
 * ==========================================
 */

/**
 * POST /api/v2/onboarding/contractor
 * Kick off onboarding for a contractor with minimal data
 */
export interface OnboardingContractorRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string; // 10 digits
  email: string; // email format
  hireDate: string; // ISO8601 date
  legalWorkAddress: LegalWorkAddressRequest;
  externalWorkerId?: string;
  approvalGroupId?: number;
}

/**
 * POST /api/v2/onboarding/employee
 * Kick off onboarding for an employee with minimal data
 */
export interface OnboardingEmployeeRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string; // 10 digits
  email: string; // email format
  payType: PayType;
  payRate: Money;
  typicalWeeklyHours?: number; // 1-40 inclusive, defaults to 40
  paySchedule?: PaySchedule;
  eligibleForOvertime?: boolean; // defaults to true
  hireDate: string; // ISO8601 date
  legalWorkAddress: LegalWorkAddressRequest;
  externalWorkerId?: string;
  approvalGroupId?: number;
  timeOffPolicyId?: number;
}

/**
 * ==========================================
 * COMPLETE WORKER ENDPOINTS (Full Data)
 * ==========================================
 */

/**
 * POST /api/v2/workers/contractor
 * Create a complete contractor record with all required data
 */
export interface CreateCompleteContractorRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string; // 10 digits
  email: string; // email format
  hireDate: string; // ISO8601 date
  homeAddress: HomeAddressRequest;
  dateOfBirth: string; // ISO8601 date
  taxpayerIdentifier: string; // 9-digit numeric string (no hyphens)
  bankAccount: BankAccountRequest;
  legalWorkAddress: LegalWorkAddressRequest;
  onboardingComplete?: boolean; // defaults to true
  externalWorkerId?: string;
  approvalGroupId?: number;
}

/**
 * POST /api/v2/workers/employee
 * Create a complete employee record with all required data
 */
export interface CreateCompleteEmployeeRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  taxpayerIdentifier: string; // 9-digit numeric string (no hyphens)
  dateOfBirth: string; // ISO8601 date
  phoneNumber: string; // 10 digits
  email: string; // email format
  homeAddress: HomeAddressRequest;
  legalWorkAddress: LegalWorkAddressRequest;
  bankAccount: BankAccountRequest;
  payType: PayType;
  payRate: Money;
  hireDate: string; // ISO8601 date
  paySchedule?: PaySchedule;
  typicalWeeklyHours: number; // 1-40 inclusive
  withholdingSettings: WithholdingSettingsRequest;
  eligibleForOvertime?: boolean; // defaults to true
  onboardingComplete?: boolean; // defaults to true
  externalWorkerId?: string;
  approvalGroupId?: number;
  timeOffPolicyId?: number;
}

/**
 * ==========================================
 * EMBEDDED COMPONENTS ENDPOINTS
 * ==========================================
 */

/**
 * POST /api/v2/embedded/workers/contractor
 * Create contractor for embedded onboarding
 */
export interface EmbeddedContractorRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string; // 10 digits
  email: string; // email format
  startDate: string; // ISO8601 date
  homeAddress: HomeAddressRequest;
  externalWorkerId?: string;
  approvalGroupId?: number;
  payeeType?: PayeeType; // defaults to INDIVIDUAL
}

/**
 * POST /api/v2/embedded/workers/employee
 * Create employee for embedded onboarding
 */
export interface EmbeddedEmployeeRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string; // 10 digits
  email: string; // email format
  payType: PayType;
  payRate: Money;
  typicalWeeklyHours?: number; // 1-40 inclusive, defaults to 40
  hireDate: string; // ISO8601 date
  legalWorkAddress: LegalWorkAddressRequest;
  homeAddress: HomeAddressRequest;
  externalWorkerId?: string;
  approvalGroupId?: number;
  timeOffPolicyId?: number;
  paySchedule?: PaySchedule;
}

/**
 * ==========================================
 * WORKER MANAGEMENT ENDPOINTS
 * ==========================================
 */

/**
 * DELETE /api/v2/workers/{workerId}
 * Delete a worker in onboarding (only allowed if no payments or timecard records exist)
 */
export interface DeleteWorkerRequest {
  workerId: string;
}

/**
 * PATCH /api/v2/workers/{workerId}
 * Update worker information (generic update interface)
 */
export interface UpdateWorkerRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

/**
 * POST /api/v2/workers/{workerId}/terminate
 * Terminate a worker
 */
export interface TerminateWorkerRequest {
  terminationDate: string; // ISO8601 date
  terminationReason?: string;
}
