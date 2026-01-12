import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ShiftRepository } from '@modules/payroll/shift/repositories/shift.repository';
import { EvereeShiftService } from '@integrations/everee/services/everee-shift.service';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';
import { ShiftStatus } from '@modules/payroll/shift/enums/shift.enum';
import { ShiftMapper } from '../mappers/shift.mapper';
import { UpdateShiftDto } from '@modules/payroll/shift/dtos';
import { ShiftResponse } from '@integrations/everee/interfaces/shift';
import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';

@Injectable()
export class ShiftManagementService {
  constructor(
    private readonly shiftRepository: ShiftRepository,
    private readonly evereeShiftService: EvereeShiftService,
  ) {}

  async getShiftFromEveree(shiftId: string): Promise<ShiftResponse> {
    const shift = await this.findById(shiftId);
    if (!shift.evereeShiftId) {
      throw new BadRequestException('Shift has no Everee ID');
    }
    return this.evereeShiftService.getShift(parseInt(shift.evereeShiftId));
  }

  async updateShift(id: string, dto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findById(id);

    if (shift.syncedWithEveree && shift.evereeShiftId) {
      const updateRequest = ShiftMapper.toUpdateShiftRequest(dto);
      await this.evereeShiftService.updateShift(
        parseInt(shift.evereeShiftId),
        updateRequest,
      );
    }

    return this.shiftRepository.update(id, dto as any);
  }

  async deleteShift(id: string, correctionAuthorized = false): Promise<void> {
    const shift = await this.findById(id);

    if (shift.status !== ShiftStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft shifts');
    }

    if (shift.syncedWithEveree && shift.evereeShiftId) {
      await this.evereeShiftService.deleteShift(
        parseInt(shift.evereeShiftId),
        correctionAuthorized,
      );
    }

    await this.shiftRepository.delete(id);
  }

  async findAll(): Promise<Shift[]> {
    return this.shiftRepository.findAll();
  }

  async findById(id: string): Promise<Shift> {
    const shift = await this.shiftRepository.findById(id);
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  async findByWorkerId(workerId: string): Promise<Shift[]> {
    return this.shiftRepository.findByWorkerId(workerId);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    return this.shiftRepository
      .findByWorkerIdAndDateRange(null as any, startDate, endDate);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<Shift>> {
    return this.shiftRepository.findWithPagination(paginationDto);
  }

  async syncShiftFromEveree(evereeShiftId: number): Promise<Shift | null> {
    const response = await this.evereeShiftService.getShift(evereeShiftId);

    const shift = await this.shiftRepository.findByEvereeShiftId(
      evereeShiftId.toString(),
    );

    if (!shift) {
      return null;
    }

    return this.updateShiftFromEvereeResponse(shift.id, response);
  }

  async updateShiftFromEvereeResponse(
    shiftId: string,
    response: ShiftResponse,
  ): Promise<Shift> {
    const shift = await this.findById(shiftId);

    const updates: Partial<Shift> = {
      evereeShiftId: response.workedShiftId.toString(),
      legalWorkTimeZone: response.legalWorkTimeZone,
      verifiedAt: response.verifiedAt ? new Date(response.verifiedAt) : null,
      verifiedByUserId: response.verifiedByUserId ?? null,
      payRateOverridden: response.payRateOverridden,
      effectiveHourlyPayRate: parseFloat(response.effectivePayRate.amount as string),
      totalPayableAmount: parseFloat(
        response.payableDetails.totalPayableAmount.amount as string,
      ),
      paid: response.payableDetails.paid,
      shiftDurationISO: response.shiftDurations.shiftDuration,
      paidBreakDurationISO: response.shiftDurations.paidBreakDuration,
      unpaidBreakDurationISO: response.shiftDurations.unpaidBreakDuration,
      regularTimeWorkedISO: response.shiftDurations.regularTimeWorked.totalDuration,
      overtimeWorkedISO: response.shiftDurations.overtimeWorked.totalDuration,
      doubleTimeWorkedISO: response.shiftDurations.doubleTimeWorked.totalDuration,
      regularTimePayableAmount: parseFloat(
        response.shiftDurations.regularTimeWorked.totalPayableAmount.amount as string,
      ),
      overtimePayableAmount: parseFloat(
        response.shiftDurations.overtimeWorked.totalPayableAmount.amount as string,
      ),
      doubleTimePayableAmount: parseFloat(
        response.shiftDurations.doubleTimeWorked.totalPayableAmount.amount as string,
      ),
      syncedWithEveree: true,
      lastSyncedWithEvereeAt: new Date(),
      status: ShiftStatus.SUBMITTED,
    };

    return this.shiftRepository.update(shiftId, updates);
  }
}
