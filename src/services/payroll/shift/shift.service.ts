import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';
import { WorkLocationRepository } from '@modules/payroll/work-location/repositories/work-location.repository';
import { WorkerRepository } from '@modules/payroll/worker/repositories/worker.repository';
import { EvereeShiftService } from '@integrations/everee/services/everee-shift.service';
import { ShiftRepository } from '@modules/payroll/shift/repositories/shift.repository';
import { CreateShiftDto } from '@modules/payroll/shift/dtos/create-shift.dto';
import { WorkerStatus } from '@modules/payroll/worker/enums/worker.enum';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';
import { ShiftStatus } from '@modules/payroll/shift/enums/shift.enum';
import { UpdateShiftDto } from '@modules/payroll/shift/dtos/update-shift.dto';
import { CorrectShiftDto } from '@modules/payroll/shift/dtos/correct-shift.dto';

@Injectable()
export class ShiftService {
  private readonly logger = new Logger(ShiftService.name);

  constructor(
    private readonly shiftRepository: ShiftRepository,
    private readonly workerRepository: WorkerRepository,
    private readonly workLocationRepository: WorkLocationRepository,
    private readonly evereeShiftService: EvereeShiftService,
  ) {}

  /**
   * Funcionalidad 2: Time Sheet Submission
   * Scenario 2.1: Submit basic shift with breaks
   * Scenario 2.2: Assign work location to shift (staffing industry)
   * Scenario 2.3: Send shift with workers comp class code
   * Scenario 2.4: Custom pay rate for shift
   */
  async create(dto: CreateShiftDto): Promise<Shift> {
    this.logger.log(`Creating shift for worker ${dto.workerId}`);

    // Scenario 2.5: Validate worker is active
    const worker = await this.workerRepository.findById(dto.workerId);
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${dto.workerId} not found`);
    }

    if (worker.status !== WorkerStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot create shift. Worker ${dto.workerId} is not active. Current status: ${worker.status}`,
      );
    }

    if (!worker.evereeWorkerId) {
      throw new BadRequestException(
        `Worker ${dto.workerId} has not completed Everee onboarding`,
      );
    }

    // Validate work location exists (if provided)
    if (dto.workLocationId) {
      const location = await this.workLocationRepository.findById(
        dto.workLocationId,
      );
      if (!location) {
        throw new NotFoundException(
          `Work location with ID ${dto.workLocationId} not found`,
        );
      }

      if (!location.evereeLocationId) {
        throw new BadRequestException(
          `Work location ${dto.workLocationId} has not been synced with Everee`,
        );
      }
    }

    // Check if externalId already exists (idempotency)
    const existingShift = await this.shiftRepository.findByExternalId(
      dto.externalId,
    );
    if (existingShift) {
      this.logger.warn(
        `Shift with external ID ${dto.externalId} already exists. Returning existing shift.`,
      );
      return existingShift;
    }

    // Calculate total hours
    const start = new Date(dto.shiftStartTime);
    const end = new Date(dto.shiftEndTime);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Calculate unpaid break time
    const unpaidBreakMinutes =
      dto.breaks
        ?.filter((b) => b.type === 'unpaid')
        .reduce((sum, b) => sum + b.durationMinutes, 0) || 0;

    const totalHours = (totalMinutes - unpaidBreakMinutes) / 60;

    // Create shift in Everee
    const evereeResponse = await this.evereeShiftService.createShift({
      externalId: dto.externalId,
      workerId: worker.evereeWorkerId,
      workLocationId: dto.workLocationId
        ? (await this.workLocationRepository.findById(dto.workLocationId))
            .evereeLocationId
        : undefined,
      shiftStartTime: dto.shiftStartTime,
      shiftEndTime: dto.shiftEndTime,
      breaks: dto.breaks,
      effectiveHourlyPayRate: dto.effectiveHourlyPayRate,
      workersCompClassCode: dto.workersCompClassCode,
      metadata: {
        projectName: dto.projectName,
        projectId: dto.projectId,
        notes: dto.notes,
      },
    });

    // Create shift record in database
    const shift = await this.shiftRepository.create({
      ...dto,
      totalHours,
      unpaidBreakMinutes,
      status: ShiftStatus.SUBMITTED,
    } as any);

    // Update with Everee data
    shift.evereeShiftId = evereeResponse.shiftId;
    shift.regularHours = evereeResponse.regularHours;
    shift.overtimeHours = evereeResponse.overtimeHours;
    shift.calculatedGrossPay = evereeResponse.grossPay;
    shift.syncedWithEveree = true;
    shift.lastSyncedWithEvereeAt = new Date();
    shift.submittedAt = new Date();

    await this.shiftRepository.update(shift.id, shift);

    this.logger.log(`Shift created successfully: ${shift.id}`);

    return shift;
  }

  /**
   * Funcionalidad 3: Time Sheet Corrections
   * Scenario 3.1: Correct overpayment
   * Scenario 3.2: Correct underpayment with immediate payment
   * Scenario 3.3: Cannot correct without authorization
   */
  async correctShift(dto: CorrectShiftDto): Promise<Shift> {
    this.logger.log(`Correcting shift ${dto.originalShiftId}`);

    // Validate original shift exists
    const originalShift = await this.shiftRepository.findById(
      dto.originalShiftId,
    );
    if (!originalShift) {
      throw new NotFoundException(
        `Original shift with ID ${dto.originalShiftId} not found`,
      );
    }

    // Validate pay period is finalized (corrections only for finalized periods)
    if (!originalShift.payPeriodFinalized) {
      throw new BadRequestException(
        'Cannot create correction for shift in non-finalized pay period. Edit the original shift instead.',
      );
    }

    // Scenario 3.3: Validate correction is authorized
    if (!dto.correctionAuthorized) {
      throw new BadRequestException(
        'Corrections require explicit authorization. Set correctionAuthorized=true',
      );
    }

    // Check if correction external ID already exists
    const existingCorrection = await this.shiftRepository.findByExternalId(
      dto.externalId,
    );
    if (existingCorrection) {
      this.logger.warn(
        `Correction with external ID ${dto.externalId} already exists. Returning existing correction.`,
      );
      return existingCorrection;
    }

    // Create correction in Everee
    const evereeResponse = await this.evereeShiftService.correctShift({
      shiftId: originalShift.evereeShiftId,
      externalId: dto.externalId,
      shiftStartTime: dto.shiftStartTime,
      shiftEndTime: dto.shiftEndTime,
      breaks: dto.breaks,
      effectiveHourlyPayRate: dto.effectiveHourlyPayRate,
      correctionAuthorized: dto.correctionAuthorized,
      correctionNotes: dto.correctionNotes,
      correctionPaymentTimeframe: dto.correctionPaymentTimeframe,
    });

    // Calculate total hours for correction
    const start = new Date(dto.shiftStartTime);
    const end = new Date(dto.shiftEndTime);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const unpaidBreakMinutes =
      dto.breaks
        ?.filter((b) => b.type === 'unpaid')
        .reduce((sum, b) => sum + b.durationMinutes, 0) || 0;

    const totalHours = (totalMinutes - unpaidBreakMinutes) / 60;

    // Create correction shift record
    const correctionShift = await this.shiftRepository.create({
      workerId: originalShift.workerId,
      workLocationId: originalShift.workLocationId,
      shiftStartTime: dto.shiftStartTime,
      shiftEndTime: dto.shiftEndTime,
      breaks: dto.breaks,
      effectiveHourlyPayRate: dto.effectiveHourlyPayRate,
      totalHours,
      unpaidBreakMinutes,
      externalId: dto.externalId,
      isCorrection: true,
      originalShiftId: dto.originalShiftId,
      correctionAuthorized: dto.correctionAuthorized,
      correctionNotes: dto.correctionNotes,
      status: ShiftStatus.PROCESSED,
    } as any);

    // Update with Everee data
    correctionShift.evereeShiftId = evereeResponse.correctionId;
    correctionShift.regularHours = evereeResponse.regularHours;
    correctionShift.overtimeHours = evereeResponse.overtimeHours;
    correctionShift.calculatedGrossPay = evereeResponse.grossPay;
    correctionShift.syncedWithEveree = true;
    correctionShift.lastSyncedWithEvereeAt = new Date();
    correctionShift.processedAt = new Date();

    await this.shiftRepository.update(correctionShift.id, correctionShift);

    this.logger.log(
      `Shift correction created successfully: ${correctionShift.id}`,
    );

    return correctionShift;
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

  async findPendingApproval(): Promise<Shift[]> {
    return this.shiftRepository.findPendingApproval();
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<Shift>> {
    return this.shiftRepository.findWithPagination(paginationDto);
  }

  async approveShift(id: string, approvedBy: string): Promise<Shift> {
    this.logger.log(`Approving shift ${id}`);

    const shift = await this.findById(id);

    if (shift.status !== ShiftStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot approve shift with status ${shift.status}. Only submitted shifts can be approved.`,
      );
    }

    const updated = await this.shiftRepository.update(id, {
      status: ShiftStatus.APPROVED,
      approvedBy,
      approvedAt: new Date(),
    } as any);

    this.logger.log(`Shift ${id} approved successfully`);

    return updated;
  }

  async rejectShift(id: string, rejectionReason: string): Promise<Shift> {
    this.logger.log(`Rejecting shift ${id}`);

    const shift = await this.findById(id);

    if (shift.status !== ShiftStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot reject shift with status ${shift.status}. Only submitted shifts can be rejected.`,
      );
    }

    const updated = await this.shiftRepository.update(id, {
      status: ShiftStatus.REJECTED,
      rejectionReason,
    } as any);

    this.logger.log(`Shift ${id} rejected successfully`);

    return updated;
  }

  async update(id: string, dto: UpdateShiftDto): Promise<Shift> {
    this.logger.log(`Updating shift ${id}`);

    const shift = await this.findById(id);

    // Don't allow updates if pay period is finalized
    if (shift.payPeriodFinalized) {
      throw new BadRequestException(
        'Cannot update shift in finalized pay period. Use correction instead.',
      );
    }

    const updated = await this.shiftRepository.update(id, {
      ...dto,
      shiftStartTime: dto.shiftStartTime
        ? new Date(dto.shiftStartTime)
        : undefined,
      shiftEndTime: dto.shiftEndTime ? new Date(dto.shiftEndTime) : undefined,
    } as any);

    this.logger.log(`Shift ${id} updated successfully`);

    return updated;
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting shift ${id}`);

    const shift = await this.findById(id);

    // Don't allow deletion if synced with Everee or pay period finalized
    if (shift.syncedWithEveree && shift.payPeriodFinalized) {
      throw new BadRequestException(
        'Cannot delete shift in finalized pay period. Use correction instead.',
      );
    }

    // Delete from Everee if synced
    if (shift.evereeShiftId) {
      await this.evereeShiftService.deleteShift(shift.evereeShiftId);
    }

    await this.shiftRepository.delete(id);

    this.logger.log(`Shift ${id} deleted successfully`);
  }
}
