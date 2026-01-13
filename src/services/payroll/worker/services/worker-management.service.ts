import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WorkerRepository } from '@modules/payroll/worker/repositories/worker.repository';
import { EvereeWorkerService } from '@integrations/everee/services/everee-worker.service';
import { Worker } from '@modules/payroll/worker/entities/worker.entity';
import { WorkerStatus, OnboardingStatus } from '@modules/payroll/worker/enums/worker.enum';
import { WorkerMapper } from '../mappers/worker.mapper';
import {
  PaginationDto,
  IPaginationResponse,
} from '@common/dto/pagination.dto';
import {
  UpdateWorkerDto,
  TerminateWorkerDto,
  UpdatePositionDto,
  UpdateHomeAddressDto,
} from '@modules/payroll/worker/dtos/management';
import { GetWorkerResponse } from '@integrations/everee/interfaces/worker';

@Injectable()
export class WorkerManagementService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly evereeWorkerService: EvereeWorkerService,
  ) {}

  async getWorkerFromEveree(workerId: string): Promise<GetWorkerResponse> {
    const worker = await this.findById(workerId);
    if (!worker.evereeWorkerId) {
      throw new BadRequestException('Worker has no Everee ID');
    }
    return this.evereeWorkerService.getWorkerById(worker.evereeWorkerId);
  }

  async updateWorker(id: string, dto: UpdateWorkerDto): Promise<Worker> {
    const worker = await this.findById(id);

    if (worker.syncedWithEveree && worker.evereeWorkerId) {
      const updateRequest = WorkerMapper.toUpdateWorkerRequest(dto);
      await this.evereeWorkerService.updateWorker(
        worker.evereeWorkerId,
        updateRequest,
      );
    }

    return this.workerRepository.update(id, dto);
  }

  async terminateWorker(id: string, dto: TerminateWorkerDto): Promise<Worker> {
    const worker = await this.findById(id);

    if (worker.syncedWithEveree && worker.evereeWorkerId) {
      const terminateRequest = WorkerMapper.toTerminateWorkerRequest(dto);
      await this.evereeWorkerService.terminateWorker(
        worker.evereeWorkerId,
        terminateRequest,
      );
    }

    return this.workerRepository.update(id, {
      status: WorkerStatus.TERMINATED,
      terminationDate: new Date(dto.terminationDate),
    });
  }

  async deleteWorker(id: string): Promise<void> {
    const worker = await this.findById(id);

    if (worker.status !== WorkerStatus.PENDING_ONBOARDING) {
      throw new BadRequestException(
        'Can only delete workers still in onboarding',
      );
    }

    if (worker.syncedWithEveree && worker.evereeWorkerId) {
      await this.evereeWorkerService.deleteWorker(worker.evereeWorkerId);
    }

    await this.workerRepository.delete(id);
  }

  async findAll(): Promise<Worker[]> {
    return this.workerRepository.findAll();
  }

  async findById(id: string): Promise<Worker> {
    const worker = await this.workerRepository.findById(id);
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    return worker;
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<Worker>> {
    return this.workerRepository.findWithPagination(paginationDto);
  }

  async validateWorkerIsActive(workerId: string): Promise<void> {
    const worker = await this.findById(workerId);
    if (worker.status !== WorkerStatus.ACTIVE) {
      throw new BadRequestException(`Worker is not active: ${worker.status}`);
    }
    if (!worker.evereeWorkerId) {
      throw new BadRequestException(
        'Worker has not completed Everee onboarding',
      );
    }
  }

  async handleOnboardingComplete(
    externalWorkerId: string,
    evereeWorkerId: string,
    workerProfile: any,
  ): Promise<Worker> {
    const worker =
      await this.workerRepository.findByExternalId(externalWorkerId);
    if (!worker) {
      throw new NotFoundException(
        `Worker not found with external ID ${externalWorkerId}`,
      );
    }

    const updates: Partial<Worker> = {
      evereeWorkerId,
      onboardingStatus: OnboardingStatus.COMPLETED,
      onboardingCompletedAt: new Date(),
      status: WorkerStatus.ACTIVE,
      lastSyncedWithEvereeAt: new Date(),
      syncedWithEveree: true,
      onboardingData: workerProfile,
    };

    return this.workerRepository.update(worker.id, updates);
  }

  async updatePosition(id: string, dto: UpdatePositionDto): Promise<GetWorkerResponse> {
    const worker = await this.findById(id);

    if (!worker.externalId) {
      throw new BadRequestException('Worker has no external ID');
    }

    const updateRequest = WorkerMapper.toUpdatePositionRequest(dto);
    const evereeResponse = await this.evereeWorkerService.updatePosition(
      worker.externalId,
      updateRequest,
    );

    await this.workerRepository.update(id, {
      lastSyncedWithEvereeAt: new Date(),
    });

    return evereeResponse;
  }

  async updateHomeAddress(id: string, dto: UpdateHomeAddressDto): Promise<GetWorkerResponse> {
    const worker = await this.findById(id);

    if (!worker.externalId) {
      throw new BadRequestException('Worker has no external ID');
    }

    const updateRequest = WorkerMapper.toUpdateHomeAddressRequest(dto);
    const evereeResponse = await this.evereeWorkerService.updateHomeAddress(
      worker.externalId,
      updateRequest,
    );

    await this.workerRepository.update(id, {
      address: dto.line1,
      city: dto.city,
      state: dto.state,
      zipCode: dto.postalCode,
      lastSyncedWithEvereeAt: new Date(),
    });

    return evereeResponse;
  }
}
