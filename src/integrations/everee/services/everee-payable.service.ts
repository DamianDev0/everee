import { Injectable, Logger } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import {
  EvereeCreatePayableRequest,
  EvereePayableResponse,
  EvereeApprovePayableRequest,
  EvereeRejectPayableRequest,
  EvereeProcessPayablesRequest,
  EvereeProcessPayablesResponse,
} from '../interfaces/payable.interface';

@Injectable()
export class EvereePayableService {
  private readonly logger = new Logger(EvereePayableService.name);

  constructor(private readonly httpClient: EvereeHttpClient) {}

  async createPayable(
    request: EvereeCreatePayableRequest,
  ): Promise<EvereePayableResponse> {
    this.logger.log(
      `Creating payable for worker ${request.workerId}, amount: $${request.amount}`,
    );

    const response = await this.httpClient.corePost<
      EvereePayableResponse,
      EvereeCreatePayableRequest
    >('/payables', request);

    this.logger.log(
      `Payable created successfully. Payable ID: ${response.payableId}`,
    );

    return response;
  }

  async getPayable(payableId: string): Promise<EvereePayableResponse> {
    this.logger.log(`Fetching payable details for ID: ${payableId}`);

    return this.httpClient.coreGet<EvereePayableResponse>(
      `/payables/${payableId}`,
    );
  }

  async getPayableByExternalId(
    externalId: string,
  ): Promise<EvereePayableResponse | null> {
    this.logger.log(`Fetching payable by external ID: ${externalId}`);

    try {
      return await this.httpClient.coreGet<EvereePayableResponse>(
        `/payables/external/${externalId}`,
      );
    } catch {
      this.logger.warn(`Payable not found with external ID: ${externalId}`);
      return null;
    }
  }

  async approvePayable(
    payableId: string,
    request?: EvereeApprovePayableRequest,
  ): Promise<EvereePayableResponse> {
    this.logger.log(`Approving payable ${payableId}`);

    return this.httpClient.corePost<
      EvereePayableResponse,
      EvereeApprovePayableRequest
    >(`/payables/${payableId}/approve`, request || {});
  }

  async rejectPayable(
    payableId: string,
    request: EvereeRejectPayableRequest,
  ): Promise<EvereePayableResponse> {
    this.logger.log(`Rejecting payable ${payableId}`);

    return this.httpClient.corePost<
      EvereePayableResponse,
      EvereeRejectPayableRequest
    >(`/payables/${payableId}/reject`, request);
  }

  async processPayablesForPayout(
    payableIds: string[],
  ): Promise<EvereeProcessPayablesResponse> {
    this.logger.log(`Processing ${payableIds.length} payables for payout`);

    return this.httpClient.corePost<
      EvereeProcessPayablesResponse,
      EvereeProcessPayablesRequest
    >('/payables/process', { payableIds });
  }

  async deletePayable(payableId: string): Promise<void> {
    this.logger.log(`Deleting payable ${payableId}`);

    await this.httpClient.coreDelete<void>(
      `/payables/${payableId}`,
    );
  }

  async listPayablesByWorker(
    workerId: string,
  ): Promise<EvereePayableResponse[]> {
    this.logger.log(`Fetching payables for worker ${workerId}`);

    return this.httpClient.coreGet<EvereePayableResponse[]>(
      `/workers/${workerId}/payables`,
    );
  }
}
