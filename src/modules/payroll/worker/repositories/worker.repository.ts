import { IWorkerRepository } from './interfaces/worker.repository.interface';
import { Repository } from 'typeorm';
import { Worker } from '../entities/worker.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerStatus, OnboardingStatus } from '../enums/worker.enum';
import { BaseRepository } from '@common/repositories/base.repository';

@Injectable()
export class WorkerRepository extends BaseRepository<Worker> implements IWorkerRepository {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
  ) {
    super(workerRepository);
  }

  async findByEmail(email: string): Promise<Worker | null> {
    return await this.workerRepository.findOne({
      where: { email },
    });
  }

  async findByExternalId(externalId: string): Promise<Worker | null> {
    return await this.workerRepository.findOne({
      where: { externalId },
    });
  }

  async findByEvereeWorkerId(evereeWorkerId: string): Promise<Worker | null> {
    return await this.workerRepository.findOne({
      where: { evereeWorkerId },
    });
  }

  async findActiveWorkers(): Promise<Worker[]> {
    return await this.workerRepository.find({
      where: { status: WorkerStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingOnboarding(): Promise<Worker[]> {
    return await this.workerRepository.find({
      where: {
        status: WorkerStatus.PENDING_ONBOARDING,
        onboardingStatus: OnboardingStatus.IN_PROGRESS,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
