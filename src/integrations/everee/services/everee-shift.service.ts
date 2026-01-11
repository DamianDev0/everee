import { Injectable } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import {
  CreateShiftRequest,
  UpdateShiftRequest,
  ShiftResponse,
  BulkClassifiedHoursRequest,
  ListShiftsQuery,
} from '../interfaces/shift';

@Injectable()
export class EvereeShiftService {
  constructor(private readonly httpClient: EvereeHttpClient) {}

  async createShift(
    request: CreateShiftRequest,
    correctionAuthorized = false,
  ): Promise<ShiftResponse> {
    const queryParam = correctionAuthorized ? '?correction-authorized=true' : '';
    return this.httpClient.integrationPost<ShiftResponse, CreateShiftRequest>(
      `/labor/timesheet/worked-shifts${queryParam}`,
      request,
    );
  }

  async updateShift(
    workedShiftId: number,
    request: UpdateShiftRequest,
    correctionAuthorized = false,
  ): Promise<ShiftResponse> {
    const queryParam = correctionAuthorized ? '?correction-authorized=true' : '';
    return this.httpClient.integrationPut<ShiftResponse, UpdateShiftRequest>(
      `/labor/timesheet/worked-shifts/${workedShiftId}${queryParam}`,
      request,
    );
  }

  async deleteShift(
    workedShiftId: number,
    correctionAuthorized = false,
  ): Promise<void> {
    const queryParam = correctionAuthorized ? '?correction-authorized=true' : '';
    return this.httpClient.integrationDelete(
      `/labor/timesheet/worked-shifts/${workedShiftId}${queryParam}`,
    );
  }

  async getShift(shiftId: number): Promise<ShiftResponse> {
    return this.httpClient.integrationGet<ShiftResponse>(
      `/labor/timesheet/worked-shifts/${shiftId}`,
    );
  }

  async listShifts(query?: ListShiftsQuery): Promise<ShiftResponse[]> {
    const params = new URLSearchParams();

    if (query?.['worker-id']) {
      query['worker-id'].forEach(id => params.append('worker-id', id));
    }
    if (query?.['external-worker-id']) {
      query['external-worker-id'].forEach(id => params.append('external-worker-id', id));
    }
    if (query?.['payment-id']) {
      query['payment-id'].forEach(id => params.append('payment-id', id.toString()));
    }
    if (query?.['min-work-location-start-date']) {
      params.append('min-work-location-start-date', query['min-work-location-start-date']);
    }
    if (query?.['max-work-location-start-date']) {
      params.append('max-work-location-start-date', query['max-work-location-start-date']);
    }
    if (query?.['min-work-location-end-date']) {
      params.append('min-work-location-end-date', query['min-work-location-end-date']);
    }
    if (query?.['max-work-location-end-date']) {
      params.append('max-work-location-end-date', query['max-work-location-end-date']);
    }
    if (query?.page !== undefined) params.append('page', query.page.toString());
    if (query?.size !== undefined) params.append('size', query.size.toString());

    const queryString = params.toString();
    return this.httpClient.integrationGet<ShiftResponse[]>(
      `/labor/timesheet/worked-shifts${queryString ? `?${queryString}` : ''}`,
    );
  }

  async updateBulkClassifiedHours(
    request: BulkClassifiedHoursRequest,
    correctionAuthorized = false,
  ): Promise<void> {
    const queryParam = correctionAuthorized ? '?correction-authorized=true' : '';
    return this.httpClient.integrationPost<void, BulkClassifiedHoursRequest>(
      `/labor/classified-hours/bulk${queryParam}`,
      request,
    );
  }
}

