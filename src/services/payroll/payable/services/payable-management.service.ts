import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PayableRepository } from '@modules/payroll/payable/repositories/payable.repository';
import { EvereePayableService } from '@integrations/everee/services/everee-payable.service';
import { Payable } from '@modules/payroll/payable/entities/payable.entity';
import { PayableStatus } from '@modules/payroll/payable/enums/payable.enum';
import { PayableMapper } from '../mappers/payable.mapper';
import { UpdatePayableDto } from '@modules/payroll/payable/dtos';
import { PayableResponse, ProcessPayablesRequest, ProcessPayablesResponse } from '@integrations/everee/interfaces/payable';
import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';

@Injectable()
export class PayableManagementService {
  constructor(
    private readonly payableRepository: PayableRepository,
    private readonly evereePayableService: EvereePayableService,
  ) {}

  async getPayableFromEveree(payableId: string): Promise<PayableResponse> {
    const payable = await this.findById(payableId);
    if (!payable.externalId) {
      throw new BadRequestException('Payable has no external ID');
    }
    return this.evereePayableService.getPayable(payable.externalId);
  }

  async updatePayable(id: string, dto: UpdatePayableDto): Promise<Payable> {
    const payable = await this.findById(id);

    if (payable.syncedWithEveree && payable.externalId) {
      const updateRequest = PayableMapper.toUpdatePayableRequest(dto, payable);
      await this.evereePayableService.updatePayable(
        payable.externalId,
        updateRequest,
      );
    }

    return this.payableRepository.update(id, dto as any);
  }

  async deletePayable(id: string): Promise<void> {
    const payable = await this.findById(id);

    if (payable.status === PayableStatus.PAID) {
      throw new BadRequestException('Cannot delete paid payables');
    }

    if (payable.syncedWithEveree && payable.externalId) {
      await this.evereePayableService.deletePayable(payable.externalId);
    }

    await this.payableRepository.delete(id);
  }

  async processPayablesForPayout(data: {
    externalWorkerIds: string[];
    includeWorkersOnRegularPayCycle?: boolean;
  }): Promise<ProcessPayablesResponse> {
    const request: ProcessPayablesRequest = {
      externalWorkerIds: data.externalWorkerIds,
      includeWorkersOnRegularPayCycle: data.includeWorkersOnRegularPayCycle ?? false,
    };

    return this.evereePayableService.processPayablesForPayout(request);
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

  async findByExternalId(externalId: string): Promise<Payable> {
    const payable = await this.payableRepository.findByExternalId(externalId);
    if (!payable) {
      throw new NotFoundException(`Payable with external ID ${externalId} not found`);
    }
    return payable;
  }

  async findByWorkerId(workerId: string): Promise<Payable[]> {
    return this.payableRepository.findByWorkerId(workerId);
  }

  async findByStatus(status: PayableStatus): Promise<Payable[]> {
    return this.payableRepository.findByStatus(status);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<Payable>> {
    return this.payableRepository.findWithPagination(paginationDto);
  }

  async syncPayableFromEveree(externalId: string): Promise<Payable | null> {
    const response = await this.evereePayableService.getPayable(externalId);

    const payable = await this.payableRepository.findByExternalId(externalId);

    if (!payable) {
      return null;
    }

    return this.updatePayableFromEvereeResponse(payable.id, response);
  }

  async updatePayableFromEvereeResponse(
    payableId: string,
    response: PayableResponse,
  ): Promise<Payable> {
    const payable = await this.findById(payableId);

    const updates: Partial<Payable> = {
      evereeCompanyId: response.companyId,
      verified: response.verified,
      evereePaymentStatus: response.paymentStatus || null,
      evereePaymentId: response.paymentId || null,
      evereePayablePaymentRequestId: response.payablePaymentRequestId || null,
      syncedWithEveree: true,
      lastSyncedWithEvereeAt: new Date(),
    };

    if (response.paymentStatus === 'PAID') {
      updates.status = PayableStatus.PAID;
      updates.paidAt = new Date();
    } else if (response.paymentStatus === 'APPROVED') {
      updates.status = PayableStatus.APPROVED;
      updates.approvedAt = new Date();
    } else if (response.paymentStatus === 'PENDING_APPROVAL') {
      updates.status = PayableStatus.PENDING_APPROVAL;
    } else if (response.paymentStatus === 'CANCELLED') {
      updates.status = PayableStatus.REJECTED;
    }

    return this.payableRepository.update(payableId, updates);
  }

  async markPayableAsPaid(externalId: string, paymentId: number): Promise<Payable> {
    const payable = await this.findByExternalId(externalId);

    const updates: Partial<Payable> = {
      status: PayableStatus.PAID,
      paidAt: new Date(),
      evereePaymentId: paymentId,
      evereePaymentStatus: 'PAID',
    };

    return this.payableRepository.update(payable.id, updates);
  }
}
