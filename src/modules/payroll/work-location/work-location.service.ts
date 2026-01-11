import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkLocation } from './entities/work-location.entity';
import { EvereeWorkLocationService } from '@integrations/everee/services/everee-work-location.service';
import {
  CreateWorkLocationRequest,
  WorkLocationResponse,
} from '@integrations/everee/interfaces/work-location';

@Injectable()
export class WorkLocationService {
  private readonly logger = new Logger(WorkLocationService.name);

  constructor(
    @InjectRepository(WorkLocation)
    private readonly workLocationRepository: Repository<WorkLocation>,
    private readonly evereeWorkLocationService: EvereeWorkLocationService,
  ) {}

  /**
   * Create work location locally and sync to Everee
   * CRITICAL: Work locations MUST be created BEFORE assigning shifts
   * Determines tax jurisdiction for each shift
   */
  async createWorkLocation(data: {
    name: string;
    address: string;
    addressLine2?: string;
    city: string;
    state: string;
    stateAbbreviation: string;
    zipCode: string;
    phoneNumber?: string;
    latitude?: number;
    longitude?: number;
    effectiveDate?: Date;
    clientName?: string;
    clientId?: string;
    notes?: string;
  }): Promise<WorkLocation> {
    this.logger.log(`Creating work location: ${data.name}`);

    // Generate deterministic external ID for idempotency
    const externalId = `location-${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Create local work location entity
    const workLocation = this.workLocationRepository.create({
      externalId,
      name: data.name,
      address: data.address,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      stateAbbreviation: data.stateAbbreviation,
      zipCode: data.zipCode,
      country: 'US',
      phoneNumber: data.phoneNumber,
      latitude: data.latitude,
      longitude: data.longitude,
      effectiveDate: data.effectiveDate || new Date(),
      clientName: data.clientName,
      clientId: data.clientId,
      notes: data.notes,
      isActive: true,
    });

    // Save locally first
    const savedLocation = await this.workLocationRepository.save(workLocation);

    // Sync to Everee asynchronously
    this.syncWorkLocationToEveree(savedLocation).catch(error => {
      this.logger.error(
        `Failed to sync work location to Everee: ${error.message}`,
        error.stack,
      );
    });

    return savedLocation;
  }

  /**
   * Sync work location to Everee API
   */
  private async syncWorkLocationToEveree(workLocation: WorkLocation): Promise<void> {
    try {
      // Prepare Everee request
      const evereeRequest: CreateWorkLocationRequest = {
        name: workLocation.name,
        line1: workLocation.address,
        line2: workLocation.addressLine2,
        city: workLocation.city,
        state: workLocation.stateAbbreviation,
        postalCode: workLocation.zipCode,
        phoneNumber: workLocation.phoneNumber,
        latitude: workLocation.latitude,
        longitude: workLocation.longitude,
        effectiveDate: workLocation.effectiveDate.toISOString().split('T')[0], // YYYY-MM-DD
        externalId: workLocation.externalId,
      };

      // Call Everee API
      const response = await this.evereeWorkLocationService.createWorkLocation(
        evereeRequest,
      );

      // Update local entity with Everee response
      await this.updateWorkLocationFromEvereeResponse(workLocation.id, response);

      this.logger.log(`Successfully synced work location ${workLocation.id} to Everee`);
    } catch (error) {
      this.logger.error(
        `Failed to sync work location ${workLocation.id} to Everee: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Update local work location entity with data from Everee response
   */
  async updateWorkLocationFromEvereeResponse(
    workLocationId: string,
    response: WorkLocationResponse,
  ): Promise<WorkLocation> {
    const workLocation = await this.workLocationRepository.findOne({
      where: { id: workLocationId },
    });
    if (!workLocation) {
      throw new NotFoundException(`Work location ${workLocationId} not found`);
    }

    // Map Everee response to local entity
    workLocation.evereeLocationId = response.id.toString();
    workLocation.latitude = response.latitude;
    workLocation.longitude = response.longitude;
    workLocation.timeZone = response.timeZone; // CRITICAL field

    // Update address if not set
    if (!workLocation.address) workLocation.address = response.line1;
    if (!workLocation.addressLine2 && response.line2)
      workLocation.addressLine2 = response.line2;
    if (!workLocation.city) workLocation.city = response.city;
    if (!workLocation.stateAbbreviation) workLocation.stateAbbreviation = response.state;
    if (!workLocation.zipCode) workLocation.zipCode = response.postalCode;

    // Update sync tracking
    workLocation.syncedWithEveree = true;
    workLocation.lastSyncedWithEvereeAt = new Date();

    return this.workLocationRepository.save(workLocation);
  }

  /**
   * Get work location by ID
   */
  async getWorkLocationById(id: string): Promise<WorkLocation> {
    const workLocation = await this.workLocationRepository.findOne({
      where: { id },
    });

    if (!workLocation) {
      throw new NotFoundException(`Work location ${id} not found`);
    }

    return workLocation;
  }

  /**
   * Get work location by external ID
   */
  async getWorkLocationByExternalId(externalId: string): Promise<WorkLocation> {
    const workLocation = await this.workLocationRepository.findOne({
      where: { externalId },
    });

    if (!workLocation) {
      throw new NotFoundException(
        `Work location with external ID ${externalId} not found`,
      );
    }

    return workLocation;
  }

  /**
   * Get work location by Everee ID
   */
  async getWorkLocationByEvereeId(evereeLocationId: string): Promise<WorkLocation> {
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

  /**
   * List all work locations
   */
  async listWorkLocations(includeInactive = false): Promise<WorkLocation[]> {
    const query = this.workLocationRepository.createQueryBuilder('workLocation');

    if (!includeInactive) {
      query.where('workLocation.isActive = :isActive', { isActive: true });
    }

    return query.orderBy('workLocation.name', 'ASC').getMany();
  }

  /**
   * List work locations by client
   */
  async listWorkLocationsByClient(clientId: string): Promise<WorkLocation[]> {
    return this.workLocationRepository.find({
      where: { clientId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Update work location
   */
  async updateWorkLocation(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      addressLine2: string;
      city: string;
      state: string;
      stateAbbreviation: string;
      zipCode: string;
      phoneNumber: string;
      latitude: number;
      longitude: number;
      clientName: string;
      clientId: string;
      isActive: boolean;
      notes: string;
    }>,
  ): Promise<WorkLocation> {
    const workLocation = await this.getWorkLocationById(id);

    Object.assign(workLocation, data);

    return this.workLocationRepository.save(workLocation);
  }

  /**
   * Archive work location (soft delete)
   */
  async archiveWorkLocation(id: string): Promise<WorkLocation> {
    const workLocation = await this.getWorkLocationById(id);

    workLocation.isActive = false;

    // Archive in Everee if synced
    if (workLocation.syncedWithEveree && workLocation.evereeLocationId) {
      try {
        await this.evereeWorkLocationService.archiveWorkLocation(
          workLocation.evereeLocationId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to archive work location in Everee: ${error.message}`,
        );
      }
    }

    return this.workLocationRepository.save(workLocation);
  }

  /**
   * Sync work location from Everee (when receiving webhook or manual sync)
   */
  async syncWorkLocationFromEveree(evereeLocationId: string): Promise<WorkLocation> {
    const response = await this.evereeWorkLocationService.getWorkLocation(
      evereeLocationId,
    );

    // Find local work location by evereeLocationId
    let workLocation = await this.workLocationRepository.findOne({
      where: { evereeLocationId },
    });

    if (workLocation) {
      // Update existing work location
      return this.updateWorkLocationFromEvereeResponse(workLocation.id, response);
    }

    // If not found, create new work location from Everee data
    this.logger.log(
      `Work location ${evereeLocationId} not found locally, creating from Everee data`,
    );

    const newLocation = this.workLocationRepository.create({
      evereeLocationId: response.id.toString(),
      externalId: `everee-${response.id}`,
      name: `Location ${response.id}`,
      address: response.line1,
      addressLine2: response.line2,
      city: response.city,
      state: response.state,
      stateAbbreviation: response.state,
      zipCode: response.postalCode,
      country: 'US',
      latitude: response.latitude,
      longitude: response.longitude,
      timeZone: response.timeZone,
      isActive: true,
      syncedWithEveree: true,
      lastSyncedWithEvereeAt: new Date(),
    });

    return this.workLocationRepository.save(newLocation);
  }

  /**
   * Sync all work locations from Everee
   */
  async syncAllWorkLocationsFromEveree(): Promise<WorkLocation[]> {
    this.logger.log('Syncing all work locations from Everee');

    const response = await this.evereeWorkLocationService.listWorkLocations();

    const syncedLocations: WorkLocation[] = [];

    for (const evereeLocation of response.items) {
      try {
        const location = await this.syncWorkLocationFromEveree(
          evereeLocation.id.toString(),
        );
        syncedLocations.push(location);
      } catch (error) {
        this.logger.error(
          `Failed to sync work location ${evereeLocation.id}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Successfully synced ${syncedLocations.length} work locations`);

    return syncedLocations;
  }
}
