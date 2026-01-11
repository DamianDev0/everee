import { Injectable } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import {
  CreatePayableRequest,
  CreatePayableBulkRequest,
  UpdatePayableRequest,
  ProcessPayablesRequest,
  DeletePayablesBulkRequest,
  ListUnpaidPayablesQuery,
  PayableResponse,
  PaginatedPayableResponse,
  CreatePayableBulkResponse,
  ProcessPayablesResponse,
} from '../interfaces/payable';

@Injectable()
export class EvereePayableService {
  constructor(private readonly httpClient: EvereeHttpClient) {}

  async createPayable(request: CreatePayableRequest): Promise<PayableResponse> {
    return this.httpClient.corePost<PayableResponse, CreatePayableRequest>(
      '/payables',
      request,
    );
  }

  async createPayablesBulk(
    request: CreatePayableBulkRequest,
  ): Promise<CreatePayableBulkResponse> {
    return this.httpClient.corePost<CreatePayableBulkResponse, CreatePayableBulkRequest>(
      '/payables/bulk',
      request,
    );
  }

  async updatePayable(
    externalId: string,
    request: UpdatePayableRequest,
  ): Promise<PayableResponse> {
    return this.httpClient.corePut<PayableResponse, UpdatePayableRequest>(
      `/payables/${externalId}`,
      request,
    );
  }

  async getPayable(externalId: string): Promise<PayableResponse> {
    return this.httpClient.coreGet<PayableResponse>(`/payables/${externalId}`);
  }

  async listUnpaidPayables(
    externalWorkerId: string,
    query?: ListUnpaidPayablesQuery,
  ): Promise<PaginatedPayableResponse> {
    const params = new URLSearchParams();
    if (query?.page !== undefined) params.append('page', query.page.toString());
    if (query?.size !== undefined) params.append('size', query.size.toString());

    const queryString = params.toString();
    return this.httpClient.coreGet<PaginatedPayableResponse>(
      `/payables/unpaid-for-worker/${externalWorkerId}${queryString ? `?${queryString}` : ''}`,
    );
  }

  async deletePayable(externalId: string): Promise<void> {
    return this.httpClient.coreDelete(`/payables/${externalId}`);
  }

  async deletePayablesBulk(request: DeletePayablesBulkRequest): Promise<void> {
    return this.httpClient.corePost<void, DeletePayablesBulkRequest>(
      '/payables/delete-bulk',
      request,
    );
  }

  async processPayablesForPayout(
    request: ProcessPayablesRequest,
  ): Promise<ProcessPayablesResponse> {
    return this.httpClient.corePost<ProcessPayablesResponse, ProcessPayablesRequest>(
      '/payables/payment-request',
      request,
    );
  }
}
