import { Injectable } from '@nestjs/common';
import { WorkLocation } from '@modules/payroll/work-location/entities/work-location.entity';
import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';
import { CreateWorkLocationDto, UpdateWorkLocationDto } from '@modules/payroll/work-location/dtos';
import { WorkLocationResponse } from '@integrations/everee/interfaces/work-location';
import { WorkLocationCreationService, WorkLocationManagementService } from './services';

@Injectable()
export class WorkLocationService {
  constructor(
    private readonly creationService: WorkLocationCreationService,
    private readonly managementService: WorkLocationManagementService,
  ) {}

  async createWorkLocation(
    dto: CreateWorkLocationDto,
  ): Promise<{ workLocation: WorkLocation; evereeResponse: WorkLocationResponse }> {
    return this.creationService.createWorkLocation(dto);
  }

  async getWorkLocationFromEveree(locationId: string): Promise<WorkLocationResponse> {
    return this.managementService.getWorkLocationFromEveree(locationId);
  }

  async updateWorkLocation(id: string, dto: UpdateWorkLocationDto): Promise<WorkLocation> {
    return this.managementService.updateWorkLocation(id, dto);
  }

  async archiveWorkLocation(id: string): Promise<WorkLocation> {
    return this.managementService.archiveWorkLocation(id);
  }

  async findAll(includeInactive = false): Promise<WorkLocation[]> {
    return this.managementService.findAll(includeInactive);
  }

  async findById(id: string): Promise<WorkLocation> {
    return this.managementService.findById(id);
  }

  async findByExternalId(externalId: string): Promise<WorkLocation> {
    return this.managementService.findByExternalId(externalId);
  }

  async findByEvereeLocationId(evereeLocationId: string): Promise<WorkLocation> {
    return this.managementService.findByEvereeLocationId(evereeLocationId);
  }

  async findByState(stateAbbreviation: string): Promise<WorkLocation[]> {
    return this.managementService.findByState(stateAbbreviation);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<WorkLocation>> {
    return this.managementService.findWithPagination(paginationDto);
  }

  async listWorkLocations(includeInactive = false): Promise<WorkLocation[]> {
    return this.managementService.findAll(includeInactive);
  }

  async getWorkLocationById(id: string): Promise<WorkLocation> {
    return this.managementService.findById(id);
  }
}
