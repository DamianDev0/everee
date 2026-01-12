import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EvereeWorkLocationService } from '@integrations/everee/services/everee-work-location.service';
import {
  CreateWorkLocationRequest,
  WorkLocationResponse,
} from '@integrations/everee/interfaces/work-location';

import { WorkLocation } from '@modules/payroll/work-location/entities/work-location.entity';
import { CreateWorkLocationDto } from '@modules/payroll/work-location/dtos/create-work-location.dto';


@Injectable()
export class WorkLocationService {
  private readonly logger = new Logger(WorkLocationService.name);

  constructor(
    @InjectRepository(WorkLocation)
    private readonly workLocationRepository: Repository<WorkLocation>,
    private readonly evereeWorkLocationService: EvereeWorkLocationService,
  ) {}

  async createWorkLocation(
    dto: CreateWorkLocationDto,
  ): Promise<WorkLocation> {
    const evereeResponse = await this.createInEveree(dto);

    const workLocation = this.workLocationRepository.create({
      name: dto.name,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      stateAbbreviation: dto.stateAbbreviation,
      zipCode: dto.zipCode,
      country: dto.country ?? 'US',
      latitude: evereeResponse.latitude ?? dto.latitude,
      longitude: evereeResponse.longitude ?? dto.longitude,
      externalId: dto.externalId,
      evereeLocationId: evereeResponse.id.toString(),
      timeZone: evereeResponse.timeZone,
      clientName: dto.clientName,
      clientId: dto.clientId,
      notes: dto.notes,
      isActive: dto.isActive ?? true,
      syncedWithEveree: true,
      lastSyncedWithEvereeAt: new Date(),
    });

    return this.workLocationRepository.save(workLocation);
  }

  private async createInEveree(
    dto: CreateWorkLocationDto,
  ): Promise<WorkLocationResponse> {
    const request: CreateWorkLocationRequest = {
      name: dto.name,
      line1: dto.address,
      city: dto.city,
      state: dto.stateAbbreviation,
      postalCode: dto.zipCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      effectiveDate: new Date().toISOString().split('T')[0],
      externalId: dto.externalId,
    };

    return this.evereeWorkLocationService.createWorkLocation(request);
  }

  async getWorkLocationById(id: string): Promise<WorkLocation> {
    const workLocation = await this.workLocationRepository.findOne({
      where: { id },
    });

    if (!workLocation) {
      throw new NotFoundException(`Work location ${id} not found`);
    }

    return workLocation;
  }

  async getWorkLocationByEvereeId(
    evereeLocationId: string,
  ): Promise<WorkLocation> {
    const workLocation = await this.workLocationRepository.findOne({
      where: { evereeLocationId },
    });

    if (!workLocation) {
      throw new NotFoundException(
        `Work location with Everee ID ${evereeLocationId} not found`,
      );
    }

    return workLocation;
  }

  async listWorkLocations(includeInactive = false): Promise<WorkLocation[]> {
    const query =
      this.workLocationRepository.createQueryBuilder('workLocation');

    if (!includeInactive) {
      query.where('workLocation.isActive = :isActive', { isActive: true });
    }

    return query.orderBy('workLocation.name', 'ASC').getMany();
  }

  async updateWorkLocation(
    id: string,
    data: Partial<WorkLocation>,
  ): Promise<WorkLocation> {
    const workLocation = await this.getWorkLocationById(id);
    Object.assign(workLocation, data);
    return this.workLocationRepository.save(workLocation);
  }

  async archiveWorkLocation(id: string): Promise<WorkLocation> {
    const workLocation = await this.getWorkLocationById(id);
    workLocation.isActive = false;

    if (workLocation.syncedWithEveree && workLocation.evereeLocationId) {
      await this.evereeWorkLocationService.archiveWorkLocation(
        workLocation.evereeLocationId,
      );
    }

    return this.workLocationRepository.save(workLocation);
  }
}
