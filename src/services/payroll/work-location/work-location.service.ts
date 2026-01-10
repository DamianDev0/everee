import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';
import { CreateWorkLocationDto } from '@modules/payroll/work-location/dtos/create-work-location.dto';
import { EvereeWorkLocationService } from '@integrations/everee/services/everee-work-location.service';
import { WorkLocationRepository } from '@modules/payroll/work-location/repositories/work-location.repository';
import { WorkLocation } from '@modules/payroll/work-location/entities/work-location.entity';
import { UpdateWorkLocationDto } from '@modules/payroll/work-location/dtos/update-work-location.dto';

@Injectable()
export class WorkLocationService {
  private readonly logger = new Logger(WorkLocationService.name);

  constructor(
    private readonly workLocationRepository: WorkLocationRepository,
    private readonly evereeWorkLocationService: EvereeWorkLocationService,
  ) {}

  /**
   * Create work location
   * CRITICAL for staffing industry - must be created before assigning shifts
   * Determines tax jurisdiction for each shift
   */
  async create(dto: CreateWorkLocationDto): Promise<WorkLocation> {
    this.logger.log(`Creating work location ${dto.name} in ${dto.stateAbbreviation}`);

    // Check if externalId already exists
    const existing = await this.workLocationRepository.findByExternalId(
      dto.externalId,
    );
    if (existing) {
      throw new ConflictException(
        `Work location with external ID ${dto.externalId} already exists`,
      );
    }

    // Create work location in Everee
    const evereeResponse = await this.evereeWorkLocationService.createWorkLocation({
      externalId: dto.externalId,
      name: dto.name,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      stateAbbreviation: dto.stateAbbreviation,
      zipCode: dto.zipCode,
      country: dto.country || 'US',
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    // Create work location record in database
    const location = await this.workLocationRepository.create(dto);

    // Update with Everee data
    
    location.syncedWithEveree = true;
    location.lastSyncedWithEvereeAt = new Date();

    await this.workLocationRepository.update(location.id, location);

    this.logger.log(`Work location created successfully: ${location.id}`);

    return location;
  }

  async findAll(): Promise<WorkLocation[]> {
    return this.workLocationRepository.findAll();
  }

  async findById(id: string): Promise<WorkLocation> {
    const location = await this.workLocationRepository.findById(id);

    if (!location) {
      throw new NotFoundException(`Work location with ID ${id} not found`);
    }

    return location;
  }

  async findActiveLocations(): Promise<WorkLocation[]> {
    return this.workLocationRepository.findActiveLocations();
  }

  async findByState(stateAbbreviation: string): Promise<WorkLocation[]> {
    return this.workLocationRepository.findByState(stateAbbreviation);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<WorkLocation>> {
    return this.workLocationRepository.findWithPagination(paginationDto);
  }

  async update(id: string, dto: UpdateWorkLocationDto): Promise<WorkLocation> {
    this.logger.log(`Updating work location ${id}`);

    const location = await this.findById(id);

    // Update in Everee if synced
    if (location.evereeLocationId) {
      await this.evereeWorkLocationService.updateWorkLocation(
        location.evereeLocationId,
        {
          name: dto.name,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          stateAbbreviation: dto.stateAbbreviation,
          zipCode: dto.zipCode,
          country: dto.country,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      );
    }

    const updated = await this.workLocationRepository.update(id, dto);

    this.logger.log(`Work location ${id} updated successfully`);

    return updated;
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting work location ${id}`);

    const location = await this.findById(id);

    // Delete from Everee if synced
    if (location.evereeLocationId) {
      await this.evereeWorkLocationService.deleteWorkLocation(
        location.evereeLocationId,
      );
    }

    await this.workLocationRepository.delete(id);

    this.logger.log(`Work location ${id} deleted successfully`);
  }
}
