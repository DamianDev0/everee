import { Injectable, ConflictException } from '@nestjs/common';
import { WorkLocationRepository } from '@modules/payroll/work-location/repositories/work-location.repository';
import { EvereeWorkLocationService } from '@integrations/everee/services/everee-work-location.service';
import { WorkLocation } from '@modules/payroll/work-location/entities/work-location.entity';
import { WorkLocationMapper } from '../mappers/work-location.mapper';
import { CreateWorkLocationDto } from '@modules/payroll/work-location/dtos';
import { WorkLocationResponse } from '@integrations/everee/interfaces/work-location';

@Injectable()
export class WorkLocationCreationService {
  constructor(
    private readonly workLocationRepository: WorkLocationRepository,
    private readonly evereeWorkLocationService: EvereeWorkLocationService,
  ) {}

  async createWorkLocation(
    dto: CreateWorkLocationDto,
  ): Promise<{ workLocation: WorkLocation; evereeResponse: WorkLocationResponse }> {
    await this.validateWorkLocationDoesNotExist(dto.externalId);

    const evereeRequest = WorkLocationMapper.toCreateWorkLocationRequest(dto);
    const evereeResponse = await this.evereeWorkLocationService.createWorkLocation(evereeRequest);

    const workLocationData: Partial<WorkLocation> = {
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
    };

    const workLocation = await this.workLocationRepository.create(workLocationData);

    return { workLocation, evereeResponse };
  }

  private async validateWorkLocationDoesNotExist(externalId: string): Promise<void> {
    const existing = await this.workLocationRepository.findByExternalId(externalId);
    if (existing) {
      throw new ConflictException(`Work location with external ID ${externalId} already exists`);
    }
  }
}
