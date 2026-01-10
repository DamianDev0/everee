import { IPaginationResponse, PaginationDto } from '@common/dto/pagination.dto';

import { WorkLocation } from '../../entities/work-location.entity';
import { CreateWorkLocationDto } from '../../dtos/create-work-location.dto';
import { UpdateWorkLocationDto } from '../../dtos/update-work-location.dto';

export interface IWorkLocationRepository {
  /**
   * Search Methods
   */
  findAll(): Promise<WorkLocation[]>;
  findById(id: string): Promise<WorkLocation>;
  findByExternalId(externalId: string): Promise<WorkLocation | null>;
  findByEvereeLocationId(evereeLocationId: string): Promise<WorkLocation | null>;
  findActiveLocations(): Promise<WorkLocation[]>;
  findByState(stateAbbreviation: string): Promise<WorkLocation[]>;
  findWithPagination(
    paginationDto: PaginationDto,
    customizeQueryBuilder?: (qb: any) => any,
  ): Promise<IPaginationResponse<WorkLocation>>;

  /**
   * Mutation Methods
   */
  create(createDto: CreateWorkLocationDto): Promise<WorkLocation>;
  update(id: string, updateDto: UpdateWorkLocationDto): Promise<WorkLocation>;
  delete(id: string): Promise<any>;
}
