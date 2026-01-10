import { Injectable, Logger } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import {
  EvereeCreateShiftRequest,
  EvereeShiftResponse,
  EvereeUpdateShiftRequest,
  EvereeShiftCorrectionRequest,
  EvereeShiftCorrectionResponse,
} from '../interfaces/shift.interface';

@Injectable()
export class EvereeShiftService {
  private readonly logger = new Logger(EvereeShiftService.name);

  constructor(private readonly httpClient: EvereeHttpClient) {}

  async createShift(
    request: EvereeCreateShiftRequest,
  ): Promise<EvereeShiftResponse> {
    this.logger.log(
      `Creating shift for worker ${request.workerId} on ${request.shiftStartTime}`,
    );

    const response = await this.httpClient.corePost<
      EvereeShiftResponse,
      EvereeCreateShiftRequest
    >('/shifts', request);

    this.logger.log(`Shift created successfully. Shift ID: ${response.shiftId}`);

    return response;
  }

  async getShift(shiftId: string): Promise<EvereeShiftResponse> {
    this.logger.log(`Fetching shift details for ID: ${shiftId}`);

    return this.httpClient.coreGet<EvereeShiftResponse>(
      `/shifts/${shiftId}`,
    );
  }

  async getShiftByExternalId(
    externalId: string,
  ): Promise<EvereeShiftResponse | null> {
    this.logger.log(`Fetching shift by external ID: ${externalId}`);

    try {
      return await this.httpClient.coreGet<EvereeShiftResponse>(
        `/shifts/external/${externalId}`,
      );
    } catch {
      this.logger.warn(`Shift not found with external ID: ${externalId}`);
      return null;
    }
  }

  async updateShift(
    shiftId: string,
    updates: EvereeUpdateShiftRequest,
  ): Promise<EvereeShiftResponse> {
    this.logger.log(`Updating shift ${shiftId}`);

    const response = await this.httpClient.corePut<
      EvereeShiftResponse,
      EvereeUpdateShiftRequest
    >(`/shifts/${shiftId}`, updates);

    this.logger.log(`Shift ${shiftId} updated successfully`);

    return response;
  }

  async correctShift(
    request: EvereeShiftCorrectionRequest,
  ): Promise<EvereeShiftCorrectionResponse> {
    this.logger.log(
      `Correcting shift ${request.shiftId} with authorized=${request.correctionAuthorized}`,
    );

    const response = await this.httpClient.corePost<
      EvereeShiftCorrectionResponse,
      EvereeShiftCorrectionRequest
    >('/shifts/corrections', request);

    this.logger.log(
      `Shift correction created. Correction ID: ${response.correctionId}`,
    );

    return response;
  }

  async deleteShift(shiftId: string): Promise<void> {
    this.logger.log(`Deleting shift ${shiftId}`);

    await this.httpClient.coreDelete<void>(
      `/shifts/${shiftId}`,
    );

    this.logger.log(`Shift ${shiftId} deleted successfully`);
  }

  async listShiftsByWorker(workerId: string): Promise<EvereeShiftResponse[]> {
    this.logger.log(`Fetching shifts for worker ${workerId}`);

    return this.httpClient.coreGet<EvereeShiftResponse[]>(
      `/workers/${workerId}/shifts`,
    );
  }
}

