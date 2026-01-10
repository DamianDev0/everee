import { IWorkLocationRepository } from './interfaces/work-location.repository.interface';
import { Repository } from 'typeorm';
import { WorkLocation } from '../entities/work-location.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@common/repositories/base.repository';

@Injectable()
export class WorkLocationRepository extends BaseRepository<WorkLocation> implements IWorkLocationRepository {
  constructor(
    @InjectRepository(WorkLocation)
    private readonly workLocationRepository: Repository<WorkLocation>,
  ) {
    super(workLocationRepository);
  }

  async findByExternalId(externalId: string): Promise<WorkLocation | null> {
    return await this.workLocationRepository.findOne({
      where: { externalId },
    });
  }

  async findByEvereeLocationId(
    evereeLocationId: string,
  ): Promise<WorkLocation | null> {
    return await this.workLocationRepository.findOne({
      where: { evereeLocationId },
    });
  }

  async findActiveLocations(): Promise<WorkLocation[]> {
    return await this.workLocationRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByState(stateAbbreviation: string): Promise<WorkLocation[]> {
    return await this.workLocationRepository.find({
      where: { stateAbbreviation, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}
