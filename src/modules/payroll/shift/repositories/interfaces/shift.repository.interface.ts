import { IPaginationResponse, PaginationDto } from '@common/dto/pagination.dto';
import { Shift } from '../../entities/shift.entity';
import { ShiftStatus } from '../../enums/shift.enum';

export interface IShiftRepository {
  /**
   * Search Methods
   */
  findAll(): Promise<Shift[]>;
  findById(id: string): Promise<Shift>;
  findByExternalId(externalId: string): Promise<Shift | null>;
  findByEvereeShiftId(evereeShiftId: string): Promise<Shift | null>;
  findByWorkerId(workerId: string): Promise<Shift[]>;
  findByWorkerIdAndDateRange(
    workerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Shift[]>;
  findByStatus(status: ShiftStatus): Promise<Shift[]>;
  findPendingApproval(): Promise<Shift[]>;
  findByPayPeriod(startDate: Date, endDate: Date): Promise<Shift[]>;
  findWithPagination(
    paginationDto: PaginationDto,
    customizeQueryBuilder?: (qb: any) => any,
  ): Promise<IPaginationResponse<Shift>>;

  /**
   * Mutation Methods
   */
  create(payload: Partial<Shift>): Promise<Shift>;
  update(id: string, payload: Partial<Shift>): Promise<Shift>;
  delete(id: string): Promise<any>;
}
