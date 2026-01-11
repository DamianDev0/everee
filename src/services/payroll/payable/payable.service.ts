import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';
import { WorkerRepository } from '@modules/payroll/worker/repositories/worker.repository';
import { EvereePayableService } from '@integrations/everee/services/everee-payable.service';
import { PayableRepository } from '@modules/payroll/payable/repositories/payable.repository';
import { CreatePayableDto } from '@modules/payroll/payable/dtos/create-payable.dto';
import { WorkerStatus, WorkerType } from '@modules/payroll/worker/enums/worker.enum';
import { Payable } from '@modules/payroll/payable/entities/payable.entity';
import { PayableStatus, PayableType } from '@modules/payroll/payable/enums/payable.enum';
import { ApprovePayableDto } from '@modules/payroll/payable/dtos/approve-payable.dto';
import { RejectPayableDto } from '@modules/payroll/payable/dtos/reject-payable.dto';
import { UpdatePayableDto } from '@modules/payroll/payable/dtos/update-payable.dto';

@Injectable()
export class PayableService {
  private readonly logger = new Logger(PayableService.name);

  constructor(
    private readonly payableRepository: PayableRepository,
    private readonly workerRepository: WorkerRepository,
    private readonly evereePayableService: EvereePayableService,
  ) {}

  /**
   * Funcionalidad 4: Payables Management
   * Scenario 4.1: Create contractor payment with idempotency
   * Scenario 4.3: Create employee bonus
   * Scenario 4.4: Prevent duplicate payments due to network failure
   */
  async create(dto: CreatePayableDto): Promise<Payable> {
    this.logger.log(`Creating payable for worker ${dto.workerId}`);

    // Validate worker exists and is active
    const worker = await this.workerRepository.findById(dto.workerId);
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${dto.workerId} not found`);
    }

    if (worker.status !== WorkerStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot create payable. Worker ${dto.workerId} is not active. Current status: ${worker.status}`,
      );
    }

    if (!worker.evereeWorkerId) {
      throw new BadRequestException(
        `Worker ${dto.workerId} has not completed Everee onboarding`,
      );
    }

    // Validate payable type matches worker type
    if (
      dto.type === PayableType.CONTRACTOR_PAYMENT &&
      worker.workerType !== WorkerType.CONTRACTOR
    ) {
      throw new BadRequestException(
        `Cannot create contractor payment for W-2 employee. Use bonus or other payment type instead.`,
      );
    }

    // Scenario 4.4: Check if externalId already exists (idempotency)
    const existingPayable = await this.payableRepository.findByExternalId(
      dto.externalId,
    );
    if (existingPayable) {
      this.logger.warn(
        `Payable with external ID ${dto.externalId} already exists. Returning existing payable (idempotency).`,
      );
      return existingPayable;
    }

    // Map PayableType to Everee payable type
    const evereeType = this.mapPayableTypeToEveree(dto.type);

    // Create payable in Everee
    const evereeResponse = await this.evereePayableService.createPayable({
      externalId: dto.externalId,
      externalWorkerId: worker.externalId,
      type: evereeType,
      label: dto.description,
      verified: true,
      earningAmount: {
        amount: dto.amount.toString(),
        currency: 'USD',
      },
      payableModel: 'PRE_CALCULATED',
      earningType: 'CONTRACTOR',
      earningTimestamp: dto.scheduledPaymentDate
        ? Math.floor(new Date(dto.scheduledPaymentDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000),
    });

    // Create payable record in database
    const payable = await this.payableRepository.create({
      ...dto,
      scheduledPaymentDate: dto.scheduledPaymentDate
        ? new Date(dto.scheduledPaymentDate)
        : undefined,
    });

    // Update with Everee data
    payable.externalId = evereeResponse.externalId;
    payable.syncedWithEveree = true;
    payable.lastSyncedWithEvereeAt = new Date();

    await this.payableRepository.update(payable.id, payable);

    this.logger.log(`Payable created successfully: ${payable.id}`);

    return payable;
  }

  /**
   * Scenario 4.2: Approve and process contractor payment
   */
  async approve(dto: ApprovePayableDto): Promise<Payable> {
    this.logger.log(`Approving payable ${dto.payableId}`);

    const payable = await this.payableRepository.findById(dto.payableId);
    if (!payable) {
      throw new NotFoundException(
        `Payable with ID ${dto.payableId} not found`,
      );
    }

    if (payable.status !== PayableStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Cannot approve payable with status ${payable.status}. Only pending payables can be approved.`,
      );
    }

    // Approve in Everee - update verified status
    if (payable.externalId) {
      await this.evereePayableService.updatePayable(payable.externalId, {
        type: payable.type,
        label: payable.description,
        verified: true,
        earningAmount: {
          amount: payable.amount.toString(),
          currency: 'USD',
        },
        payableModel: 'PRE_CALCULATED',
        earningType: 'CONTRACTOR',
        earningTimestamp: Math.floor(Date.now() / 1000),
      });
    }

    // Update payable status
    const updated = await this.payableRepository.update(dto.payableId, {
      status: PayableStatus.APPROVED,
      approvedBy: dto.approvedBy,
      approvedAt: new Date(),
    } as any);

    this.logger.log(`Payable ${dto.payableId} approved successfully`);

    return updated;
  }

  /**
   * Reject a payable
   */
  async reject(dto: RejectPayableDto): Promise<Payable> {
    this.logger.log(`Rejecting payable ${dto.payableId}`);

    const payable = await this.payableRepository.findById(dto.payableId);
    if (!payable) {
      throw new NotFoundException(
        `Payable with ID ${dto.payableId} not found`,
      );
    }

    if (payable.status !== PayableStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Cannot reject payable with status ${payable.status}. Only pending payables can be rejected.`,
      );
    }

    // Reject in Everee - delete the payable
    if (payable.externalId) {
      await this.evereePayableService.deletePayable(payable.externalId);
    }

    // Update payable status
    const updated = await this.payableRepository.update(dto.payableId, {
      status: PayableStatus.REJECTED,
      rejectedBy: dto.rejectedBy,
      rejectedAt: new Date(),
      rejectionReason: dto.rejectionReason,
    } as any);

    this.logger.log(`Payable ${dto.payableId} rejected successfully`);

    return updated;
  }

  /**
   * Scenario 4.2: Process approved payables for payout
   * Only processes approved payables
   */
  async processApprovedPayables(): Promise<{
    processedCount: number;
    failedCount: number;
    results: any[];
  }> {
    this.logger.log('Processing approved payables for payout');

    const approvedPayables = await this.payableRepository.findApprovedAndUnprocessed();

    if (approvedPayables.length === 0) {
      this.logger.log('No approved payables to process');
      return {
        processedCount: 0,
        failedCount: 0,
        results: [],
      };
    }

    const externalWorkerIds = [
      ...new Set(approvedPayables.map((p) => p.worker?.externalId).filter(Boolean)),
    ];

    // Process in Everee
    const result = await this.evereePayableService.processPayablesForPayout({
      externalWorkerIds: externalWorkerIds as string[],
      includeWorkersOnRegularPayCycle: false,
    });

    // Update payable statuses
    for (const payable of approvedPayables) {
      await this.payableRepository.update(payable.id, {
        status: PayableStatus.PROCESSING,
        processedAt: new Date(),
      } as any);
    }

    this.logger.log(`Processed payables for ${externalWorkerIds.length} workers`);

    return {
      processedCount: approvedPayables.length,
      failedCount: 0,
      results: [],
    };
  }

  async findAll(): Promise<Payable[]> {
    return this.payableRepository.findAll();
  }

  async findById(id: string): Promise<Payable> {
    const payable = await this.payableRepository.findById(id);

    if (!payable) {
      throw new NotFoundException(`Payable with ID ${id} not found`);
    }

    return payable;
  }

  async findByWorkerId(workerId: string): Promise<Payable[]> {
    return this.payableRepository.findByWorkerId(workerId);
  }

  async findPendingApproval(): Promise<Payable[]> {
    return this.payableRepository.findPendingApproval();
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<Payable>> {
    return this.payableRepository.findWithPagination(paginationDto);
  }

  async update(id: string, dto: UpdatePayableDto): Promise<Payable> {
    this.logger.log(`Updating payable ${id}`);

    const payable = await this.findById(id);

    // Don't allow updates if already processed
    if (payable.status === PayableStatus.PAID || payable.processedAt) {
      throw new BadRequestException(
        'Cannot update payable that has already been processed',
      );
    }

    const updated = await this.payableRepository.update(id, {
      ...dto,
      scheduledPaymentDate: dto.scheduledPaymentDate
        ? new Date(dto.scheduledPaymentDate)
        : undefined,
    } as any);

    this.logger.log(`Payable ${id} updated successfully`);

    return updated;
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting payable ${id}`);

    const payable = await this.findById(id);

    // Don't allow deletion if already processed
    if (payable.status === PayableStatus.PAID || payable.processedAt) {
      throw new BadRequestException(
        'Cannot delete payable that has already been processed',
      );
    }

    // Delete from Everee if synced
    if (payable.evereePayableId) {
      await this.evereePayableService.deletePayable(payable.evereePayableId);
    }

    await this.payableRepository.delete(id);

    this.logger.log(`Payable ${id} deleted successfully`);
  }

  private mapPayableTypeToEveree(
    type: PayableType,
  ): 'contractor_payment' | 'bonus' | 'reimbursement' | 'commission' | 'other' {
    switch (type) {
      case PayableType.CONTRACTOR_PAYMENT:
        return 'contractor_payment';
      case PayableType.BONUS:
        return 'bonus';
      case PayableType.REIMBURSEMENT:
        return 'reimbursement';
      case PayableType.COMMISSION:
        return 'commission';
      default:
        return 'other';
    }
  }
}
