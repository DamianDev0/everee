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
  UpdatePersonalInfoRequest,
  UpdatePositionRequest,
  UpdateBankAccountRequest,
  UpdateLegalWorkLocationRequest,
  UpdateHomeAddressRequest,
  UpdateWorkerIdRequest,
  UpdateTaxpayerIdentifierRequest,
  UpdatePaymentPreferencesRequest,
  UpdateHireDateRequest,
  UpdateEmergencyContactRequest,
  ListWorkersQuery,
  SearchWorkersQuery,
  GetPayHistoryQuery,
  GetPayStubsQuery,
  GetPayStubDownloadQuery,
} from '../interfaces/worker';

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
  PaginatedResponse,
  SearchWorkersResponse,
  OnboardingAccessDetailsResponse,
  LeaveBalance,
  PaymentHistoryItem,
  PayStub,
  PayStubDownloadResponse,
} from '../interfaces/worker';

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

  async listWorkers(query?: ListWorkersQuery): Promise<PaginatedResponse<GetWorkerResponse>> {
    const params = new URLSearchParams();
    if (query?.id && query.id.length > 0) params.append('id', query.id.join(','));
    if (query?.lifecycleStatus && query.lifecycleStatus.length > 0) {
      params.append('lifecycleStatus', query.lifecycleStatus.join(','));
    }
    if (query?.page) params.append('page', query.page.toString());
    if (query?.size) params.append('size', query.size.toString());

    const queryString = params.toString();
    return this.httpClient.integrationGet<PaginatedResponse<GetWorkerResponse>>(
      `/workers${queryString ? `?${queryString}` : ''}`,
    );
  }

  async searchWorkers(query: SearchWorkersQuery): Promise<SearchWorkersResponse> {
    const params = new URLSearchParams();
    params.append('term', query.term);

    return this.httpClient.integrationGet<SearchWorkersResponse>(
      `/workers/search?${params.toString()}`,
    );
  }

  async getOnboardingAccessDetails(workerId: string): Promise<OnboardingAccessDetailsResponse> {
    return this.httpClient.integrationGet<OnboardingAccessDetailsResponse>(
      `/workers/onboarding-access-details?workerId=${workerId}`,
    );
  }

  async getLeaveBalances(workerId: string): Promise<LeaveBalance[]> {
    return this.httpClient.integrationGet<LeaveBalance[]>(
      `/workers/${workerId}/leave-balances`,
    );
  }

  async updatePersonalInfo(
    workerId: string,
    payload: UpdatePersonalInfoRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdatePersonalInfoRequest>(
      `/workers/${workerId}/personal-info`,
      payload,
    );
  }

  async updatePosition(
    workerId: string,
    payload: UpdatePositionRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdatePositionRequest>(
      `/workers/${workerId}/position`,
      payload,
    );
  }

  async updateBankAccount(
    workerId: string,
    payload: UpdateBankAccountRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdateBankAccountRequest>(
      `/workers/${workerId}/bank-accounts/default`,
      payload,
    );
  }

  async updateLegalWorkLocation(
    workerId: string,
    payload: UpdateLegalWorkLocationRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdateLegalWorkLocationRequest>(
      `/workers/${workerId}/legal-location`,
      payload,
    );
  }

  async updateHomeAddress(
    workerId: string,
    payload: UpdateHomeAddressRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdateHomeAddressRequest>(
      `/workers/${workerId}/address`,
      payload,
    );
  }

  async updateWorkerId(
    workerId: string,
    payload: UpdateWorkerIdRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdateWorkerIdRequest>(
      `/workers/${workerId}/worker-identifier`,
      payload,
    );
  }

  async updateTaxpayerIdentifier(
    workerId: string,
    payload: UpdateTaxpayerIdentifierRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdateTaxpayerIdentifierRequest>(
      `/workers/${workerId}/taxpayer-identifier`,
      payload,
    );
  }

  async updatePaymentPreferences(
    workerId: string,
    payload: UpdatePaymentPreferencesRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdatePaymentPreferencesRequest>(
      `/workers/${workerId}/payment-info`,
      payload,
    );
  }

  async updateHireDate(
    workerId: string,
    payload: UpdateHireDateRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdateHireDateRequest>(
      `/workers/${workerId}/hire-date`,
      payload,
    );
  }

  async updateEmergencyContact(
    workerId: string,
    payload: UpdateEmergencyContactRequest,
  ): Promise<GetWorkerResponse> {
    return this.httpClient.integrationPut<GetWorkerResponse, UpdateEmergencyContactRequest>(
      `/workers/${workerId}/emergency-contacts/default`,
      payload,
    );
  }

  async getPaymentHistory(query?: GetPayHistoryQuery): Promise<PaymentHistoryItem[]> {
    const params = new URLSearchParams();
    if (query?.workerId) params.append('workerId', query.workerId);
    if (query?.externalWorkerId) params.append('externalWorkerId', query.externalWorkerId);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.size) params.append('size', query.size.toString());

    const queryString = params.toString();
    return this.httpClient.coreGet<PaymentHistoryItem[]>(
      `/workers/payment-history${queryString ? `?${queryString}` : ''}`,
    );
  }

  async getPaymentHistoryById(paymentId: string): Promise<PaymentHistoryItem> {
    return this.httpClient.coreGet<PaymentHistoryItem>(
      `/workers/payment-history/${paymentId}`,
    );
  }

  async getPayStubs(query: GetPayStubsQuery): Promise<PayStub[]> {
    const params = new URLSearchParams();
    if (query.workerId) params.append('workerId', query.workerId);
    if (query.externalWorkerId) params.append('externalWorkerId', query.externalWorkerId);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.page) params.append('page', query.page.toString());
    if (query.size) params.append('size', query.size.toString());

    return this.httpClient.coreGet<PayStub[]>(
      `/pay-stubs?${params.toString()}`,
    );
  }

  async getPayStubDownload(query: GetPayStubDownloadQuery): Promise<PayStubDownloadResponse> {
    const params = new URLSearchParams();
    if (query.workerId) params.append('workerId', query.workerId);
    if (query.externalWorkerId) params.append('externalWorkerId', query.externalWorkerId);
    params.append('date', query.date);

    return this.httpClient.coreGet<PayStubDownloadResponse>(
      `/pay-stubs/download-link?${params.toString()}`,
    );
  }
}
