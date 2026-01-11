import { Money } from '../../common/types';
import { PayableModel, EarningType } from '../common/types';

export interface UpdatePayableRequest {
  type: string;
  label: string;
  verified: boolean;
  earningAmount: Money;
  payableModel: PayableModel;
  earningType: EarningType;
  earningTimestamp: number;
  workLocationId?: number;
}
