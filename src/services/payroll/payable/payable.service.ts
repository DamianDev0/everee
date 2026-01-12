import { Injectable } from '@nestjs/common';
import { Payable } from '@modules/payroll/payable/entities/payable.entity';
import { PayableStatus } from '@modules/payroll/payable/enums/payable.enum';
import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';
import { CreatePayableDto, UpdatePayableDto } from '@modules/payroll/payable/dtos';
import { PayableResponse, ProcessPayablesResponse } from '@integrations/everee/interfaces/payable';
import { PayableCreationService, PayableManagementService } from './services';

@Injectable()
export class PayableService {
  constructor(
    private readonly creationService: PayableCreationService,
    private readonly managementService: PayableManagementService,
  ) {}

  async createPayable(
    dto: CreatePayableDto,
  ): Promise<{ payable: Payable; evereeResponse: PayableResponse }> {
    return this.creationService.createPayable(dto);
  }

  async createPayablesBulk(
    dtos: CreatePayableDto[],
  ): Promise<Array<{ payable: Payable; evereeResponse: PayableResponse }>> {
    return this.creationService.createPayablesBulk(dtos);
  }

  async getPayableFromEveree(payableId: string): Promise<PayableResponse> {
    return this.managementService.getPayableFromEveree(payableId);
  }

  async updatePayable(id: string, dto: UpdatePayableDto): Promise<Payable> {
    return this.managementService.updatePayable(id, dto);
  }

  async deletePayable(id: string): Promise<void> {
    return this.managementService.deletePayable(id);
  }

  async processPayablesForPayout(data: {
    externalWorkerIds: string[];
    includeWorkersOnRegularPayCycle?: boolean;
  }): Promise<ProcessPayablesResponse> {
    return this.managementService.processPayablesForPayout(data);
  }

  async findAll(): Promise<Payable[]> {
    return this.managementService.findAll();
  }

  async findById(id: string): Promise<Payable> {
    return this.managementService.findById(id);
  }

  async findByExternalId(externalId: string): Promise<Payable> {
    return this.managementService.findByExternalId(externalId);
  }

  async findByWorkerId(workerId: string): Promise<Payable[]> {
    return this.managementService.findByWorkerId(workerId);
  }

  async findByStatus(status: PayableStatus): Promise<Payable[]> {
    return this.managementService.findByStatus(status);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<Payable>> {
    return this.managementService.findWithPagination(paginationDto);
  }

  async syncPayableFromEveree(externalId: string): Promise<Payable | null> {
    return this.managementService.syncPayableFromEveree(externalId);
  }

  async markPayableAsPaid(externalId: string, paymentId: number): Promise<Payable> {
    return this.managementService.markPayableAsPaid(externalId, paymentId);
  }

  async listPayablesByWorker(workerId: string): Promise<Payable[]> {
    return this.managementService.findByWorkerId(workerId);
  }

  async listUnpaidPayablesByWorker(workerId: string): Promise<Payable[]> {
    const allPayables = await this.managementService.findByWorkerId(workerId);
    return allPayables.filter(p => p.status === PayableStatus.PENDING_APPROVAL || p.status === PayableStatus.APPROVED);
  }

  async getPayableByExternalId(externalId: string): Promise<Payable> {
    return this.managementService.findByExternalId(externalId);
  }

  async getPayableById(id: string): Promise<Payable> {
    return this.managementService.findById(id);
  }
}
