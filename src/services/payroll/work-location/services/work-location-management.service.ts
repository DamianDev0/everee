import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkLocationRepository } from '@modules/payroll/work-location/repositories/work-location.repository';
import { EvereeWorkLocationService } from '@integrations/everee/services/everee-work-location.service';
import { WorkLocation } from '@modules/payroll/work-location/entities/work-location.entity';
import { WorkLocationMapper } from '../mappers/work-location.mapper';
import { UpdateWorkLocationDto } from '@modules/payroll/work-location/dtos';
import { WorkLocationResponse } from '@integrations/everee/interfaces/work-location';
import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';

@Injectable()
export class WorkLocationManagementService {
  constructor(
    private readonly workLocationRepository: WorkLocationRepository,
    private readonly evereeWorkLocationService: EvereeWorkLocationService,
  ) {}

  async getWorkLocationFromEveree(locationId: string): Promise<WorkLocationResponse> {
    const location = await this.findById(locationId);
    if (!location.evereeLocationId) {
      throw new BadRequestException('Work location has no Everee ID');
    }
    return this.evereeWorkLocationService.getWorkLocation(location.evereeLocationId);
  }

  async updateWorkLocation(id: string, dto: UpdateWorkLocationDto): Promise<WorkLocation> {
    const location = await this.findById(id);

    return this.workLocationRepository.update(id, dto as any);
  }

  async archiveWorkLocation(id: string): Promise<WorkLocation> {
    const location = await this.findById(id);

    if (!location.isActive) {
      throw new BadRequestException('Work location is already archived');
    }

    if (location.syncedWithEveree && location.evereeLocationId) {
      await this.evereeWorkLocationService.archiveWorkLocation(location.evereeLocationId);
    }

    return this.workLocationRepository.update(id, { isActive: false });
  }

  async findAll(includeInactive = false): Promise<WorkLocation[]> {
    if (!includeInactive) {
      return this.workLocationRepository.findActiveLocations();
    }
    return this.workLocationRepository.findAll();
  }

  async findById(id: string): Promise<WorkLocation> {
    const location = await this.workLocationRepository.findById(id);
    if (!location) {
      throw new NotFoundException(`Work location with ID ${id} not found`);
    }
    return location;
  }

  async findByExternalId(externalId: string): Promise<WorkLocation> {
    const location = await this.workLocationRepository.findByExternalId(externalId);
    if (!location) {
      throw new NotFoundException(`Work location with external ID ${externalId} not found`);
    }
    return location;
  }

  async findByEvereeLocationId(evereeLocationId: string): Promise<WorkLocation> {
    const location = await this.workLocationRepository.findByEvereeLocationId(evereeLocationId);
    if (!location) {
      throw new NotFoundException(`Work location with Everee ID ${evereeLocationId} not found`);
    }
    return location;
  }

  async findByState(stateAbbreviation: string): Promise<WorkLocation[]> {
    return this.workLocationRepository.findByState(stateAbbreviation);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<WorkLocation>> {
    return this.workLocationRepository.findWithPagination(paginationDto);
  }
}
