import { Injectable, ConflictException } from '@nestjs/common';
import { ShiftRepository } from '@modules/payroll/shift/repositories/shift.repository';
import { EvereeShiftService } from '@integrations/everee/services/everee-shift.service';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';
import { ShiftStatus } from '@modules/payroll/shift/enums/shift.enum';
import { ShiftMapper } from '../mappers/shift.mapper';
import { CreateShiftDto } from '@modules/payroll/shift/dtos';
import { ShiftResponse } from '@integrations/everee/interfaces/shift';
import { ShiftManagementService } from './shift-management.service';

@Injectable()
export class ShiftCreationService {
  constructor(
    private readonly shiftRepository: ShiftRepository,
    private readonly evereeShiftService: EvereeShiftService,
    private readonly shiftManagementService: ShiftManagementService,
  ) {}

  async createShift(
    dto: CreateShiftDto,
  ): Promise<{ shift: Shift; evereeResponse: ShiftResponse }> {
    const externalId = `shift-${dto.externalWorkerId}-${Date.now()}`;

    await this.validateShiftDoesNotExist(externalId);

    const evereeRequest = ShiftMapper.toCreateShiftRequest(dto);
    const evereeResponse = await this.evereeShiftService.createShift(evereeRequest);

    const shiftData: Partial<Shift> = {
      workerId: dto.workerId,
      externalId,
      workLocationId: dto.workLocationId?.toString(),
      shiftStartTime: new Date(dto.shiftStartTime),
      shiftEndTime: new Date(dto.shiftEndTime),
      effectiveHourlyPayRate: dto.effectiveHourlyPayRate,
      workersCompClassCode: dto.workersCompClassCode,
      notes: dto.notes,
      status: ShiftStatus.DRAFT,
      evereeShiftId: evereeResponse.workedShiftId.toString(),
      syncedWithEveree: true,
      lastSyncedWithEvereeAt: new Date(),
    };

    const shift = await this.shiftRepository.create(shiftData);

    await this.shiftManagementService.updateShiftFromEvereeResponse(
      shift.id,
      evereeResponse,
    );

    return { shift, evereeResponse };
  }


  private async validateShiftDoesNotExist(externalId: string): Promise<void> {
    const existing = await this.shiftRepository.findByExternalId(externalId);
    if (existing) {
      throw new ConflictException(`Shift with external ID ${externalId} already exists`);
    }
  }
}
