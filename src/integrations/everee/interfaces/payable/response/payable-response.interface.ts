import { Money } from '../../common/types';
import { PayableModel, EarningType, PaymentStatus } from '../common/types';

export interface PayableResponse {
  externalId: string;
  companyId: number;
  externalWorkerId: string;
  type: string;
  label: string;
  verified: boolean;
  earningAmount: Money;
  payableModel: PayableModel;
  earningType: EarningType;
  earningTimestamp: number;
  paymentId?: number;
  paymentStatus?: PaymentStatus;
  payablePaymentRequestId?: number;
}

export interface PaginatedPayableResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  content: PayableResponse[];
  page: number;
}

export interface CreatePayableBulkResponse {
  externalIds: string[];
}
