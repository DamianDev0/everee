import { Injectable } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import {
  CreateWorkLocationRequest,
  WorkLocationResponse,
  PaginatedWorkLocationResponse,
  CreateApprovalGroupRequest,
  ApprovalGroupResponse,
  PaginatedApprovalGroupResponse,
} from '../interfaces/work-location.interface';

@Injectable()
export class EvereeWorkLocationService {
  constructor(private readonly httpClient: EvereeHttpClient) {}

  async createWorkLocation(
    request: CreateWorkLocationRequest,
  ): Promise<WorkLocationResponse> {
    return this.httpClient.integrationPost<WorkLocationResponse, CreateWorkLocationRequest>(
      '/work-locations',
      request,
    );
  }

  async getWorkLocation(workLocationId: string): Promise<WorkLocationResponse> {
    return this.httpClient.integrationGet<WorkLocationResponse>(
      `/work-locations/${workLocationId}`,
    );
  }

  async listWorkLocations(): Promise<PaginatedWorkLocationResponse> {
    return this.httpClient.integrationGet<PaginatedWorkLocationResponse>(
      '/work-locations',
    );
  }

  async archiveWorkLocation(workLocationId: string): Promise<void> {
    return this.httpClient.integrationDelete(
      `/work-locations/${workLocationId}`,
    );
  }

  async createApprovalGroup(
    request: CreateApprovalGroupRequest,
  ): Promise<ApprovalGroupResponse> {
    return this.httpClient.integrationPost<ApprovalGroupResponse, CreateApprovalGroupRequest>(
      '/approval-groups',
      request,
    );
  }

  async listApprovalGroups(): Promise<PaginatedApprovalGroupResponse> {
    return this.httpClient.integrationGet<PaginatedApprovalGroupResponse>(
      '/approval-groups',
    );
  }
}

