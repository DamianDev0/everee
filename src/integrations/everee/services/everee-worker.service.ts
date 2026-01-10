import { Injectable } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';

// Request interfaces
import {
  OnboardingContractorRequest,
  OnboardingEmployeeRequest,
  CreateCompleteContractorRequest,
  CreateCompleteEmployeeRequest,
  EmbeddedContractorRequest,
  EmbeddedEmployeeRequest,
  UpdateWorkerRequest,
  TerminateWorkerRequest,
  CreateEmbeddedSessionRequest,
} from '../interfaces/request';

// Response interfaces
import {
  OnboardingContractorResponse,
  OnboardingEmployeeResponse,
  CreateCompleteContractorResponse,
  CreateCompleteEmployeeResponse,
  EmbeddedContractorResponse,
  EmbeddedEmployeeResponse,
  GetWorkerResponse,
  UpdateWorkerResponse,
  TerminateWorkerResponse,
  CreateEmbeddedSessionResponse,
} from '../interfaces/response';

/**
 * EvereeWorkerService
 * Service for managing worker operations with Everee API
 * Covers all worker-related endpoints:
 * - Onboarding (minimal data)
 * - Complete worker creation (full data)
 * - Embedded components
 * - Worker management (update, delete, terminate)
 */
@Injectable()
export class EvereeWorkerService {
  constructor(private readonly httpClient: EvereeHttpClient) {}



  /**

   * Kick off onboarding for a contractor with minimal data.
   * The rest of the information will be captured during Everee-managed onboarding.
   */
  async createOnboardingContractor(
    payload: OnboardingContractorRequest,
  ): Promise<OnboardingContractorResponse> {
    return this.httpClient.corePost<OnboardingContractorResponse, OnboardingContractorRequest>(
      '/onboarding/contractor',
      payload,
    );
  }

  /**

   * Kick off onboarding for an employee with minimal data.
   * The rest of the information will be captured during Everee-managed onboarding.
   */
  async createOnboardingEmployee(
    payload: OnboardingEmployeeRequest,
  ): Promise<OnboardingEmployeeResponse> {
    return this.httpClient.corePost<OnboardingEmployeeResponse, OnboardingEmployeeRequest>(
      '/onboarding/employee',
      payload,
    );
  }

  /**
   * COMPLETE WORKER ENDPOINTS (Full Data)
   */

  /**

   * Create a complete contractor record with all required data.
   * This requires capturing sensitive PII data.
   */
  async createCompleteContractor(
    payload: CreateCompleteContractorRequest,
  ): Promise<CreateCompleteContractorResponse> {
    return this.httpClient.corePost<CreateCompleteContractorResponse, CreateCompleteContractorRequest>(
      '/workers/contractor',
      payload,
    );
  }

  /**
   * POST /api/v2/workers/employee
   * Create a complete employee record with all required data.
   * This requires capturing sensitive PII data.
   */
  async createCompleteEmployee(
    payload: CreateCompleteEmployeeRequest,
  ): Promise<CreateCompleteEmployeeResponse> {
    return this.httpClient.corePost<CreateCompleteEmployeeResponse, CreateCompleteEmployeeRequest>(
      '/workers/employee',
      payload,
    );
  }

  /**
   * EMBEDDED COMPONENTS ENDPOINTS
   */

  /**

   * Create contractor for embedded onboarding.
   * Worker completes the rest via embedded component.
   */
  async createEmbeddedContractor(
    payload: EmbeddedContractorRequest,
  ): Promise<EmbeddedContractorResponse> {
    return this.httpClient.embedPost<EmbeddedContractorResponse, EmbeddedContractorRequest>(
      '/workers/contractor',
      payload,
    );
  }

  /**
   * Create employee for embedded onboarding.
   * Worker completes the rest via embedded component.
   */
  async createEmbeddedEmployee(
    payload: EmbeddedEmployeeRequest,
  ): Promise<EmbeddedEmployeeResponse> {
    return this.httpClient.embedPost<EmbeddedEmployeeResponse, EmbeddedEmployeeRequest>(
      '/workers/employee',
      payload,
    );
  }

  /**
 
   * Create an embedded component session.
   * Returns a URL to open in a web view.
   * Sessions expire quickly - create immediately before use.
   */
  async createEmbeddedSession(
    payload: CreateEmbeddedSessionRequest,
  ): Promise<CreateEmbeddedSessionResponse> {
    return this.httpClient.embedPost<CreateEmbeddedSessionResponse, CreateEmbeddedSessionRequest>(
      '/session',
      payload,
    );
  }

  /**
   * WORKER MANAGEMENT ENDPOINTS
   */

  /**
   * Get a single worker by ID
   */
  async getWorkerById(workerId: string): Promise<GetWorkerResponse> {
    return this.httpClient.coreGet<GetWorkerResponse>(`/workers/${workerId}`);
  }

  /**
   * GET /api/v2/workers?externalWorkerId={externalWorkerId}
   * Get a single worker by external ID
   */
  async getWorkerByExternalId(externalWorkerId: string): Promise<GetWorkerResponse> {
    return this.httpClient.coreGet<GetWorkerResponse>(
      `/workers?externalWorkerId=${externalWorkerId}`,
    );
  }

  /**

   * Update worker information
   */
  async updateWorker(
    workerId: string,
    payload: UpdateWorkerRequest,
  ): Promise<UpdateWorkerResponse> {
    return this.httpClient.corePatch<UpdateWorkerResponse, UpdateWorkerRequest>(
      `/workers/${workerId}`,
      payload,
    );
  }

  /**
   * Delete a worker in onboarding.
   * Only allowed if no payments or timecard records exist.
   */
  async deleteWorker(workerId: string): Promise<void> {
    return this.httpClient.coreDelete(`/workers/${workerId}`);
  }

  /**
]
   * Terminate a worker
   */
  async terminateWorker(
    workerId: string,
    payload: TerminateWorkerRequest,
  ): Promise<TerminateWorkerResponse> {
    return this.httpClient.corePost<TerminateWorkerResponse, TerminateWorkerRequest>(
      `/workers/${workerId}/terminate`,
      payload,
    );
  }
}
