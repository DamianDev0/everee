import { Injectable, Logger } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import {
  EvereeCreateWorkLocationRequest,
  EvereeWorkLocationResponse,
  EvereeUpdateWorkLocationRequest,
} from '../interfaces/work-location.interface';

@Injectable()
export class EvereeWorkLocationService {
  private readonly logger = new Logger(EvereeWorkLocationService.name);

  constructor(private readonly httpClient: EvereeHttpClient) {}

  async createWorkLocation(
    request: EvereeCreateWorkLocationRequest,
  ): Promise<EvereeWorkLocationResponse> {
    this.logger.log(
      `Creating work location ${request.name} in ${request.stateAbbreviation}`,
    );

    const response = await this.httpClient.corePost<
      EvereeWorkLocationResponse,
      EvereeCreateWorkLocationRequest
    >('/work-locations', request);

    this.logger.log(
      `Work location created successfully. Location ID: ${response.locationId}`,
    );

    return response;
  }

  async getWorkLocation(
    locationId: string,
  ): Promise<EvereeWorkLocationResponse> {
    this.logger.log(`Fetching work location details for ID: ${locationId}`);

    return this.httpClient.coreGet<EvereeWorkLocationResponse>(
      `/work-locations/${locationId}`,
    );
  }

  async getWorkLocationByExternalId(
    externalId: string,
  ): Promise<EvereeWorkLocationResponse | null> {
    this.logger.log(`Fetching work location by external ID: ${externalId}`);

    try {
      return await this.httpClient.coreGet<EvereeWorkLocationResponse>(
        `/work-locations/external/${externalId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Work location not found with external ID: ${externalId}`,
      );
      return null;
    }
  }

  async updateWorkLocation(
    locationId: string,
    updates: EvereeUpdateWorkLocationRequest,
  ): Promise<EvereeWorkLocationResponse> {
    this.logger.log(`Updating work location ${locationId}`);

    const response = await this.httpClient.corePut<
      EvereeWorkLocationResponse,
      EvereeUpdateWorkLocationRequest
    >(`/work-locations/${locationId}`, updates);

    this.logger.log(`Work location ${locationId} updated successfully`);

    return response;
  }

  async deleteWorkLocation(locationId: string): Promise<void> {
    this.logger.log(`Deleting work location ${locationId}`);

    await this.httpClient.coreDelete<void>(
      `/work-locations/${locationId}`,
    );

    this.logger.log(`Work location ${locationId} deleted successfully`);
  }

  async listWorkLocations(): Promise<EvereeWorkLocationResponse[]> {
    this.logger.log('Fetching all work locations');

    return this.httpClient.coreGet<EvereeWorkLocationResponse[]>(
      '/work-locations',
    );
  }
}

