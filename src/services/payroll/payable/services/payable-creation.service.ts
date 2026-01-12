import { Injectable, ConflictException } from '@nestjs/common';
import { PayableRepository } from '@modules/payroll/payable/repositories/payable.repository';
import { EvereePayableService } from '@integrations/everee/services/everee-payable.service';
import { Payable } from '@modules/payroll/payable/entities/payable.entity';
import { PayableStatus } from '@modules/payroll/payable/enums/payable.enum';
import { PayableMapper } from '../mappers/payable.mapper';
import { CreatePayableDto } from '@modules/payroll/payable/dtos';
import { PayableResponse } from '@integrations/everee/interfaces/payable';
import { PayableManagementService } from './payable-management.service';

@Injectable()
export class PayableCreationService {
  constructor(
    private readonly payableRepository: PayableRepository,
    private readonly evereePayableService: EvereePayableService,
    private readonly payableManagementService: PayableManagementService,
  ) {}

  async createPayable(
    dto: CreatePayableDto,
  ): Promise<{ payable: Payable; evereeResponse: PayableResponse }> {
    await this.validatePayableDoesNotExist(dto.externalId);

    const evereeRequest = PayableMapper.toCreatePayableRequest(dto);
    const evereeResponse = await this.evereePayableService.createPayable(evereeRequest);

    const payableData: Partial<Payable> = {
      workerId: dto.workerId,
      externalId: dto.externalId,
      type: dto.type,
      description: dto.description,
      amount: dto.amount,
      evereeEarningType: dto.evereeEarningType,
      evereePayableModel: 'PRE_CALCULATED',
      verified: false,
      earningTimestamp: Math.floor(Date.now() / 1000),
      projectId: dto.projectId,
      projectName: dto.projectName,
      notes: dto.notes,
      status: PayableStatus.PENDING_APPROVAL,
      syncedWithEveree: true,
      lastSyncedWithEvereeAt: new Date(),
    };

    const payable = await this.payableRepository.create(payableData);

    await this.payableManagementService.updatePayableFromEvereeResponse(
      payable.id,
      evereeResponse,
    );

    return { payable, evereeResponse };
  }

  async createPayablesBulk(
    dtos: CreatePayableDto[],
  ): Promise<Array<{ payable: Payable; evereeResponse: PayableResponse }>> {
    const results: Array<{ payable: Payable; evereeResponse: PayableResponse }> = [];

    for (const dto of dtos) {
      const result = await this.createPayable(dto);
      results.push(result);
    }

    return results;
  }

  private async validatePayableDoesNotExist(externalId: string): Promise<void> {
    const existing = await this.payableRepository.findByExternalId(externalId);
    if (existing) {
      throw new ConflictException(`Payable with external ID ${externalId} already exists`);
    }
  }
}
