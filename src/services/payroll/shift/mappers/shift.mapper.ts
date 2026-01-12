import {
  CreateShiftRequest,
  UpdateShiftRequest,
} from '@integrations/everee/interfaces/shift';

import {
  CreateShiftDto,
  UpdateShiftDto,
} from '@modules/payroll/shift/dtos';

export class ShiftMapper {
  static toCreateShiftRequest(dto: CreateShiftDto): CreateShiftRequest {
    const request: CreateShiftRequest = {
      externalWorkerId: dto.externalWorkerId,
      shiftStartEpochSeconds: Math.floor(new Date(dto.shiftStartTime).getTime() / 1000),
      shiftEndEpochSeconds: Math.floor(new Date(dto.shiftEndTime).getTime() / 1000),
    };

    if (dto.breaks?.length) {
      request.createBreaks = dto.breaks.map((br) => {
        const startMs = new Date(br.startTime).getTime();
        const endMs = new Date(br.endTime).getTime();
        const durationMinutes = Math.floor((endMs - startMs) / 60000);
        
        return {
          segmentConfigCode: br.type === 'unpaid' ? 'DEFAULT_UNPAID' : 'DEFAULT_PAID',
          breakDuration: `PT${durationMinutes}M`,
        };
      });
    }

    if (dto.effectiveHourlyPayRate !== undefined) {
      request.effectiveHourlyPayRate = {
        amount: dto.effectiveHourlyPayRate.toString(),
        currency: 'USD',
      };
    }

    if (dto.workLocationId) request.workLocationId = dto.workLocationId;
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
}
