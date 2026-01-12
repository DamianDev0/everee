import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EvereeShiftService } from '@integrations/everee/services/everee-shift.service';
import {
  CreateShiftRequest,
  ShiftResponse,
} from '@integrations/everee/interfaces/shift';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';
import { ShiftStatus } from '@modules/payroll/shift/enums/shift.enum';

@Injectable()
export class ShiftService {
  private readonly logger = new Logger(ShiftService.name);

  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    private readonly evereeShiftService: EvereeShiftService,
  ) {}

  async createShift(data: {
    workerId: string;
    externalWorkerId: string;
    workLocationId?: string;
    shiftStartTime: Date;
    shiftEndTime: Date;
    breaks?: Array<{ startTime: Date; endTime: Date }>;
    effectiveHourlyPayRate?: number;
    displayHourlyPayRate?: number;
    workersCompClassCode?: string;
    taxCalculationConfigCode?: string;
    departmentId?: string;
    costCenterId?: string;
    projectId?: string;
    projectName?: string;
    notes?: string;
  }): Promise<Shift> {
    this.logger.log(`Creating shift for worker ${data.workerId}`);

    const externalId = `shift-${data.externalWorkerId}-${data.shiftStartTime.getTime()}`;

    const shift = this.shiftRepository.create({
      workerId: data.workerId,
      externalId,
      workLocationId: data.workLocationId,
      shiftStartTime: data.shiftStartTime,
      shiftEndTime: data.shiftEndTime,
      effectiveHourlyPayRate: data.effectiveHourlyPayRate,
      displayHourlyPayRate: data.displayHourlyPayRate,
      workersCompClassCode: data.workersCompClassCode,
      taxCalculationConfigCode: data.taxCalculationConfigCode,
      departmentId: data.departmentId,
      costCenterId: data.costCenterId,
      projectId: data.projectId,
      projectName: data.projectName,
      notes: data.notes,
      status: ShiftStatus.DRAFT,
    });

    const savedShift = await this.shiftRepository.save(shift);

    this.syncShiftToEveree(savedShift, data.externalWorkerId).catch((error) => {
      this.logger.error(
        `Failed to sync shift to Everee: ${error.message}`,
        error.stack,
      );
    });

    return savedShift;
  }

  /**
   * Sync shift to Everee API
   */
  private async syncShiftToEveree(
    shift: Shift,
    externalWorkerId: string,
  ): Promise<void> {
    try {
      const evereeRequest: CreateShiftRequest = {
        externalWorkerId,
        shiftStartEpochSeconds: Math.floor(
          shift.shiftStartTime.getTime() / 1000,
        ),
        shiftEndEpochSeconds: Math.floor(shift.shiftEndTime.getTime() / 1000),
        effectiveHourlyPayRate: shift.effectiveHourlyPayRate
          ? { amount: shift.effectiveHourlyPayRate.toString(), currency: 'USD' }
          : undefined,
        displayHourlyPayRate: shift.displayHourlyPayRate
          ? { amount: shift.displayHourlyPayRate.toString(), currency: 'USD' }
          : undefined,
        workersCompClassCode: shift.workersCompClassCode,
        taxCalculationConfigCode: shift.taxCalculationConfigCode as any,
        dimensions: {
          departmentId: shift.departmentId,
          projectId: shift.projectId,
          costCenterId: shift.costCenterId,
        },
        note: shift.notes,
      };

      const response = await this.evereeShiftService.createShift(evereeRequest);

      await this.updateShiftFromEvereeResponse(shift.id, response);

      this.logger.log(`Successfully synced shift ${shift.id} to Everee`);
    } catch (error) {
      this.logger.error(
        `Failed to sync shift ${shift.id} to Everee: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Update local shift entity with data from Everee response
   */
  async updateShiftFromEvereeResponse(
    shiftId: string,
    response: ShiftResponse,
  ): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
    });
    if (!shift) {
      throw new NotFoundException(`Shift ${shiftId} not found`);
    }

    shift.evereeShiftId = response.workedShiftId.toString();
    shift.legalWorkTimeZone = response.legalWorkTimeZone;
    shift.verifiedAt = response.verifiedAt
      ? new Date(response.verifiedAt)
      : null;
    shift.verifiedByUserId = response.verifiedByUserId ?? null;
    shift.payRateOverridden = response.payRateOverridden;
    shift.effectiveHourlyPayRate = parseFloat(
      response.effectivePayRate.amount as string,
    );

    shift.totalPayableAmount = parseFloat(
      response.payableDetails.totalPayableAmount.amount as string,
    );
    shift.paid = response.payableDetails.paid;

    // Update durations (ISO 8601 format)
    shift.shiftDurationISO = response.shiftDurations.shiftDuration;
    shift.paidBreakDurationISO = response.shiftDurations.paidBreakDuration;
    shift.unpaidBreakDurationISO = response.shiftDurations.unpaidBreakDuration;
    shift.regularTimeWorkedISO =
      response.shiftDurations.regularTimeWorked.totalDuration;
    shift.overtimeWorkedISO =
      response.shiftDurations.overtimeWorked.totalDuration;
    shift.doubleTimeWorkedISO =
      response.shiftDurations.doubleTimeWorked.totalDuration;

    shift.regularTimePayableAmount = parseFloat(
      response.shiftDurations.regularTimeWorked.totalPayableAmount
        .amount as string,
    );
    shift.overtimePayableAmount = parseFloat(
      response.shiftDurations.overtimeWorked.totalPayableAmount
        .amount as string,
    );
    shift.doubleTimePayableAmount = parseFloat(
      response.shiftDurations.doubleTimeWorked.totalPayableAmount
        .amount as string,
    );

    shift.syncedWithEveree = true;
    shift.lastSyncedWithEvereeAt = new Date();
    shift.status = ShiftStatus.SUBMITTED;

    return this.shiftRepository.save(shift);
  }

  async getShiftById(id: string): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['worker', 'workLocation'],
    });

    if (!shift) {
      throw new NotFoundException(`Shift ${id} not found`);
    }

    return shift;
  }

  async listShiftsByWorker(workerId: string): Promise<Shift[]> {
    return this.shiftRepository.find({
      where: { workerId },
      relations: ['worker', 'workLocation'],
      order: { shiftStartTime: 'DESC' },
    });
  }

  /**
   * List shifts for a date range
   */
  async listShiftsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Shift[]> {
    return this.shiftRepository
      .createQueryBuilder('shift')
      .where('shift.shiftStartTime >= :startDate', { startDate })
      .andWhere('shift.shiftStartTime <= :endDate', { endDate })
      .leftJoinAndSelect('shift.worker', 'worker')
      .leftJoinAndSelect('shift.workLocation', 'workLocation')
      .orderBy('shift.shiftStartTime', 'DESC')
      .getMany();
  }

  /**
   * Update shift
   */
  async updateShift(
    id: string,
    data: Partial<{
      shiftEndTime: Date;
      effectiveHourlyPayRate: number;
      notes: string;
      status: ShiftStatus;
    }>,
  ): Promise<Shift> {
    const shift = await this.getShiftById(id);

    Object.assign(shift, data);

    return this.shiftRepository.save(shift);
  }

  /**
   * Delete shift (also deletes from Everee if synced)
   */
  async deleteShift(id: string, correctionAuthorized = false): Promise<void> {
    const shift = await this.getShiftById(id);

    if (shift.syncedWithEveree && shift.evereeShiftId) {
      try {
        await this.evereeShiftService.deleteShift(
          parseInt(shift.evereeShiftId),
          correctionAuthorized,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete shift from Everee: ${error.message}`,
        );
        throw error;
      }
    }

    await this.shiftRepository.remove(shift);
  }

  /**
   * Sync shift from Everee (when receiving webhook)
   */
  async syncShiftFromEveree(evereeShiftId: number): Promise<Shift | null> {
    const response = await this.evereeShiftService.getShift(evereeShiftId);

    let shift = await this.shiftRepository.findOne({
      where: { evereeShiftId: evereeShiftId.toString() },
    });

    if (shift) {
      return this.updateShiftFromEvereeResponse(shift.id, response);
    }

    this.logger.warn(`Shift ${evereeShiftId} not found locally, skipping sync`);
    return null;
  }
}
