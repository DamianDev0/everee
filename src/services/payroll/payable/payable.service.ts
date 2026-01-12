import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EvereePayableService } from '@integrations/everee/services/everee-payable.service';
import {
  CreatePayableRequest,
  PayableResponse,
  ProcessPayablesRequest,
  ProcessPayablesResponse,
} from '@integrations/everee/interfaces/payable';

import { Payable } from '@modules/payroll/payable/entities/payable.entity';
import { PayableStatus, PayableType } from '@modules/payroll/payable/enums/payable.enum';

@Injectable()
export class PayableService {
  private readonly logger = new Logger(PayableService.name);

  constructor(
    @InjectRepository(Payable)
    private readonly payableRepository: Repository<Payable>,
    private readonly evereePayableService: EvereePayableService,
  ) {}

  /**
   * Create payable locally and sync to Everee
   * This is step 3 in the Everee flow
   * Used for:
   * - Contractors (ALL payments)
   * - Employees (bonuses, reimbursements, commissions, etc.)
   */
  async createPayable(data: {
    workerId: string;
    externalWorkerId: string;
    type: PayableType;
    description: string;
    amount: number;
    evereeEarningType: string; // BONUS, COMMISSION, CONTRACTOR, etc.
    verified?: boolean;
    earningTimestamp?: Date;
    workLocationId?: number;
    unitRateAmount?: number;
    unitCount?: number;
    projectId?: string;
    projectName?: string;
    notes?: string;
  }): Promise<Payable> {
    this.logger.log(`Creating payable for worker ${data.workerId}`);

    // Generate deterministic external ID for idempotency
    const externalId = `payable-${data.externalWorkerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create local payable entity
    const payable = this.payableRepository.create({
      workerId: data.workerId,
      externalId,
      type: data.type,
      description: data.description,
      amount: data.amount,
      evereeEarningType: data.evereeEarningType,
      evereePayableModel: 'PRE_CALCULATED',
      verified: data.verified ?? false,
      earningTimestamp: data.earningTimestamp
        ? Math.floor(data.earningTimestamp.getTime() / 1000)
        : Math.floor(Date.now() / 1000),
      evereeWorkLocationId: data.workLocationId,
      unitRateAmount: data.unitRateAmount,
      unitRateCurrency: data.unitRateAmount ? 'USD' : undefined,
      unitCount: data.unitCount,
      projectId: data.projectId,
      projectName: data.projectName,
      notes: data.notes,
      status: PayableStatus.PENDING_APPROVAL,
    });

    // Save locally first
    const savedPayable = await this.payableRepository.save(payable);

    // Sync to Everee asynchronously
    this.syncPayableToEveree(savedPayable, data.externalWorkerId).catch(error => {
      this.logger.error(`Failed to sync payable to Everee: ${error.message}`, error.stack);
    });

    return savedPayable;
  }

  /**
   * Create multiple payables in bulk
   */
  async createPayablesBulk(
    payables: Array<{
      workerId: string;
      externalWorkerId: string;
      type: PayableType;
      description: string;
      amount: number;
      evereeEarningType: string;
      verified?: boolean;
      workLocationId?: number;
    }>,
  ): Promise<Payable[]> {
    this.logger.log(`Creating ${payables.length} payables in bulk`);

    const createdPayables: Payable[] = [];

    for (const data of payables) {
      const payable = await this.createPayable(data);
      createdPayables.push(payable);
    }

    return createdPayables;
  }

  /**
   * Sync payable to Everee API
   */
  private async syncPayableToEveree(
    payable: Payable,
    externalWorkerId: string,
  ): Promise<void> {
    try {
      // Prepare Everee request
      const evereeRequest: CreatePayableRequest = {
        externalId: payable.externalId,
        externalWorkerId,
        type: payable.type,
        label: payable.description,
        verified: payable.verified,
        earningAmount: {
          amount: payable.amount.toString(),
          currency: 'USD',
        },
        payableModel: 'PRE_CALCULATED',
        earningType: payable.evereeEarningType as any,
        earningTimestamp: payable.earningTimestamp,
        workLocationId: payable.evereeWorkLocationId,
        unitRate: payable.unitRateAmount
          ? {
              amount: payable.unitRateAmount.toString(),
              currency: payable.unitRateCurrency || 'USD',
            }
          : undefined,
        unitCount: payable.unitCount,
      };

      // Call Everee API
      const response = await this.evereePayableService.createPayable(evereeRequest);

      // Update local entity with Everee response
      await this.updatePayableFromEvereeResponse(payable.id, response);

      this.logger.log(`Successfully synced payable ${payable.id} to Everee`);
    } catch (error) {
      this.logger.error(
        `Failed to sync payable ${payable.id} to Everee: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Update local payable entity with data from Everee response
   */
  async updatePayableFromEvereeResponse(
    payableId: string,
    response: PayableResponse,
  ): Promise<Payable> {
    const payable = await this.payableRepository.findOne({
      where: { id: payableId },
    });
    if (!payable) {
      throw new NotFoundException(`Payable ${payableId} not found`);
    }

    // Map Everee response to local entity
    payable.evereeCompanyId = response.companyId;
    payable.verified = response.verified;
    payable.evereePaymentStatus = response.paymentStatus || null;
    payable.evereePaymentId = response.paymentId || null;
    payable.evereePayablePaymentRequestId = response.payablePaymentRequestId || null;

    // Update sync tracking
    payable.syncedWithEveree = true;
    payable.lastSyncedWithEvereeAt = new Date();

    // Map Everee payment status to local status
    if (response.paymentStatus === 'PAID') {
      payable.status = PayableStatus.PAID;
      payable.paidAt = new Date();
    } else if (response.paymentStatus === 'APPROVED') {
      payable.status = PayableStatus.APPROVED;
      payable.approvedAt = new Date();
    } else if (response.paymentStatus === 'PENDING_APPROVAL') {
      payable.status = PayableStatus.PENDING_APPROVAL;
    } else if (response.paymentStatus === 'CANCELLED') {
      payable.status = PayableStatus.REJECTED;
    }

    return this.payableRepository.save(payable);
  }

  /**
   * Process payables for payout (Step 4 in Everee flow)
   * For CONTRACTORS: Always required
   * For EMPLOYEES: Only for off-cycle/immediate payments
   */
  async processPayablesForPayout(data: {
    externalWorkerIds: string[];
    includeWorkersOnRegularPayCycle?: boolean; // Set to true for employees doing off-cycle
  }): Promise<ProcessPayablesResponse> {
    this.logger.log(`Processing payables for payout: ${data.externalWorkerIds.join(', ')}`);

    const request: ProcessPayablesRequest = {
      externalWorkerIds: data.externalWorkerIds,
      includeWorkersOnRegularPayCycle: data.includeWorkersOnRegularPayCycle ?? false,
    };

    const response = await this.evereePayableService.processPayablesForPayout(request);

    this.logger.log(`Successfully processed payables for payout`);

    return response;
  }

  /**
   * Get payable by ID
   */
  async getPayableById(id: string): Promise<Payable> {
    const payable = await this.payableRepository.findOne({
      where: { id },
      relations: ['worker'],
    });

    if (!payable) {
      throw new NotFoundException(`Payable ${id} not found`);
    }

    return payable;
  }

  /**
   * Get payable by external ID
   */
  async getPayableByExternalId(externalId: string): Promise<Payable> {
    const payable = await this.payableRepository.findOne({
      where: { externalId },
      relations: ['worker'],
    });

    if (!payable) {
      throw new NotFoundException(`Payable with external ID ${externalId} not found`);
    }

    return payable;
  }

  /**
   * List payables for a worker
   */
  async listPayablesByWorker(workerId: string): Promise<Payable[]> {
    return this.payableRepository.find({
      where: { workerId },
      relations: ['worker'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * List unpaid payables for a worker
   */
  async listUnpaidPayablesByWorker(workerId: string): Promise<Payable[]> {
    return this.payableRepository.find({
      where: {
        workerId,
        status: PayableStatus.PENDING_APPROVAL,
      },
      relations: ['worker'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update payable
   */
  async updatePayable(
    id: string,
    data: Partial<{
      amount: number;
      description: string;
      verified: boolean;
      status: PayableStatus;
      notes: string;
    }>,
  ): Promise<Payable> {
    const payable = await this.getPayableById(id);

    Object.assign(payable, data);

    const updatedPayable = await this.payableRepository.save(payable);

    // If synced to Everee, update there as well
    if (
      payable.syncedWithEveree &&
      payable.externalId &&
      (data.description || data.verified !== undefined || data.amount)
    ) {
      try {
        await this.evereePayableService.updatePayable(payable.externalId, {
          type: payable.type,
          label: data.description ?? payable.description,
          verified: data.verified ?? payable.verified,
          earningAmount: {
            amount: (data.amount ?? payable.amount).toString(),
            currency: 'USD',
          },
          payableModel: 'PRE_CALCULATED',
          earningType: payable.evereeEarningType as any,
          earningTimestamp: payable.earningTimestamp,
        });
      } catch (error) {
        this.logger.error(`Failed to update payable in Everee: ${error.message}`);
      }
    }

    return updatedPayable;
  }

  /**
   * Delete payable (also deletes from Everee if synced)
   */
  async deletePayable(id: string): Promise<void> {
    const payable = await this.getPayableById(id);

    // If synced to Everee, delete there first
    if (payable.syncedWithEveree && payable.externalId) {
      try {
        await this.evereePayableService.deletePayable(payable.externalId);
      } catch (error) {
        this.logger.error(`Failed to delete payable from Everee: ${error.message}`);
        throw error;
      }
    }

    await this.payableRepository.remove(payable);
  }

  /**
   * Sync payable from Everee (when receiving webhook)
   */
  async syncPayableFromEveree(externalId: string): Promise<Payable | null> {
    const response = await this.evereePayableService.getPayable(externalId);

    // Find local payable by externalId
    let payable = await this.payableRepository.findOne({
      where: { externalId },
    });

    if (payable) {
      // Update existing payable
      return this.updatePayableFromEvereeResponse(payable.id, response);
    }

    // If not found, this might be a new payable created outside our system
    this.logger.warn(`Payable ${externalId} not found locally, skipping sync`);
    return null;
  }

  /**
   * Mark payable as paid (from webhook)
   */
  async markPayableAsPaid(externalId: string, paymentId: number): Promise<Payable> {
    const payable = await this.getPayableByExternalId(externalId);

    payable.status = PayableStatus.PAID;
    payable.paidAt = new Date();
    payable.evereePaymentId = paymentId;
    payable.evereePaymentStatus = 'PAID';

    return this.payableRepository.save(payable);
  }
}
