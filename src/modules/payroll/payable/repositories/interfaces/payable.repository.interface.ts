import { IPaginationResponse, PaginationDto } from '@common/dto/pagination.dto';
import { Payable } from '../../entities/payable.entity';
import { PayableStatus, PayableType } from '../../enums/payable.enum';

export interface IPayableRepository {
  /**
   * Search Methods
   */
  findAll(): Promise<Payable[]>;
  findById(id: string): Promise<Payable>;
  findByExternalId(externalId: string): Promise<Payable | null>;
  findByEvereePayableId(evereePayableId: string): Promise<Payable | null>;
  findByWorkerId(workerId: string): Promise<Payable[]>;
  findByStatus(status: PayableStatus): Promise<Payable[]>;
  findByType(type: PayableType): Promise<Payable[]>;
  findPendingApproval(): Promise<Payable[]>;
  findApprovedAndUnprocessed(): Promise<Payable[]>;
  findWithPagination(
    paginationDto: PaginationDto,
    customizeQueryBuilder?: (qb: any) => any,
  ): Promise<IPaginationResponse<Payable>>;

  /**
   * Mutation Methods
   */
  create(payload: Partial<Payable>): Promise<Payable>;
  update(id: string, payload: Partial<Payable>): Promise<Payable>;
  delete(id: string): Promise<any>;
}
