import { IPaginationResponse, PaginationDto } from '@common/dto/pagination.dto';
import { Worker } from '../../entities/worker.entity';

export interface IWorkerRepository {
  /**
   * Search Methods
   */
  findAll(): Promise<Worker[]>;
  findById(id: string): Promise<Worker>;
  findByEmail(email: string): Promise<Worker | null>;
  findByExternalId(externalId: string): Promise<Worker | null>;
  findByEvereeWorkerId(evereeWorkerId: string): Promise<Worker | null>;
  findActiveWorkers(): Promise<Worker[]>;
  findPendingOnboarding(): Promise<Worker[]>;
  findWithPagination(
    paginationDto: PaginationDto,
    customizeQueryBuilder?: (qb: any) => any,
  ): Promise<IPaginationResponse<Worker>>;

  /**
   * Mutation Methods
   */
  create(payload: Partial<Worker>): Promise<Worker>;
  update(id: string, payload: Partial<Worker>): Promise<Worker>;
  delete(id: string): Promise<any>;
}
