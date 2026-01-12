import {
  CreateShiftRequest,
  UpdateShiftRequest,
} from '@integrations/everee/interfaces/shift';

import {
  CreateShiftDto,
  UpdateShiftDto,
  CorrectShiftDto,
} from '@modules/payroll/shift/dtos';

export class ShiftMapper {
  static toCreateShiftRequest(dto: CreateShiftDto): CreateShiftRequest {
    const request: CreateShiftRequest = {
      externalWorkerId: dto.externalWorkerId,
      shiftStartEpochSeconds: Math.floor(new Date(dto.shiftStartTime).getTime() / 1000),
      shiftEndEpochSeconds: Math.floor(new Date(dto.shiftEndTime).getTime() / 1000),
    };

    if (dto.breaks?.length) {
      request.createBreaks = dto.breaks.map((br) => ({
        type: br.type as any,
        breakStartEpochSeconds: Math.floor(new Date(br.startTime).getTime() / 1000),
        breakEndEpochSeconds: Math.floor(new Date(br.endTime).getTime() / 1000),
        startTime: br.startTime,
        endTime: br.endTime,
        durationMinutes: br.durationMinutes,
      }));
    }

    if (dto.effectiveHourlyPayRate !== undefined) {
      request.effectiveHourlyPayRate = {
        amount: dto.effectiveHourlyPayRate.toString(),
        currency: 'USD',
      };
    }

    if (dto.workersCompClassCode) request.workersCompClassCode = dto.workersCompClassCode;
    if (dto.notes) request.note = dto.notes;

    return request;
  }

  static toUpdateShiftRequest(dto: UpdateShiftDto): UpdateShiftRequest {
    const request: UpdateShiftRequest = {
      shiftStartEpochSeconds: Math.floor(new Date(dto.shiftStartTime!).getTime() / 1000),
      shiftEndEpochSeconds: Math.floor(new Date(dto.shiftEndTime!).getTime() / 1000),
    };

    if (dto.effectiveHourlyPayRate !== undefined) {
      request.effectiveHourlyPayRate = {
        amount: dto.effectiveHourlyPayRate.toString(),
        currency: 'USD',
      };
    }

    if (dto.workersCompClassCode) request.workersCompClassCode = dto.workersCompClassCode;
    if (dto.notes) request.note = dto.notes;

    return request;
  }

  static toCorrectShiftRequest(dto: CorrectShiftDto): CreateShiftRequest {
    const request: CreateShiftRequest = {
      externalWorkerId: dto.externalId,
      shiftStartEpochSeconds: Math.floor(new Date(dto.shiftStartTime).getTime() / 1000),
      shiftEndEpochSeconds: Math.floor(new Date(dto.shiftEndTime).getTime() / 1000),
      correctionPaymentTimeframe: dto.correctionPaymentTimeframe as any,
    };

    if (dto.breaks?.length) {
      request.createBreaks = dto.breaks.map((br) => ({
        type: br.type as any,
        breakStartEpochSeconds: Math.floor(new Date(br.startTime).getTime() / 1000),
        breakEndEpochSeconds: Math.floor(new Date(br.endTime).getTime() / 1000),
        startTime: br.startTime,
        endTime: br.endTime,
        durationMinutes: br.durationMinutes,
      }));
    }

    if (dto.effectiveHourlyPayRate !== undefined) {
      request.effectiveHourlyPayRate = {
        amount: dto.effectiveHourlyPayRate.toString(),
        currency: 'USD',
      };
    }

    if (dto.correctionNotes) request.note = dto.correctionNotes;

    return request;
  }
}
