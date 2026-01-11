import { Money } from '../../common/types';
import { PayableModel, EarningType, UnitRate } from '../common/types';

export interface CreatePayableRequest {
  externalId: string;
  workerId?: string;
  externalWorkerId?: string;
  type: string;
  label: string;
  verified: boolean;
  earningAmount: Money;
  unitRate?: UnitRate;
  unitCount?: number;
  payableModel: PayableModel;
  earningType: EarningType;
  earningTimestamp: number;
  workLocationId?: number;
}

export interface CreatePayableBulkRequest {
  payables: CreatePayableRequest[];
}
