import {
  CreatePayableRequest,
  EarningType,
  UpdatePayableRequest,
} from '@integrations/everee/interfaces/payable';

import {
  CreatePayableDto,
  UpdatePayableDto,
} from '@modules/payroll/payable/dtos';

export class PayableMapper {
  static toCreatePayableRequest(dto: CreatePayableDto): CreatePayableRequest {
    const request: CreatePayableRequest = {
      type: 'PRE_CALCULATED',
      externalId: dto.externalId,
      externalWorkerId: dto.externalWorkerId,
      label: dto.description,
      verified: false,
      earningAmount: {
        amount: dto.amount.toString(),
        currency: 'USD',
      },
      payableModel: 'PRE_CALCULATED',
      earningType: dto.evereeEarningType as any,
      earningTimestamp: Math.floor(Date.now() / 1000),
    };

    return request;
  }

  static toUpdatePayableRequest(dto: UpdatePayableDto, originalPayable: any): UpdatePayableRequest {
    const request: UpdatePayableRequest = {
      type: 'PRE_CALCULATED',
      label: dto.description ?? originalPayable.description,
      verified: originalPayable.verified ?? false,
      earningAmount: {
        amount: (dto.amount ?? originalPayable.amount).toString(),
        currency: 'USD',
      },
      payableModel: 'PRE_CALCULATED',
      earningType: (dto.evereeEarningType ?? originalPayable.evereeEarningType) as EarningType,
      earningTimestamp: originalPayable.earningTimestamp ?? Math.floor(Date.now() / 1000),
    };

    return request;
  }
}
