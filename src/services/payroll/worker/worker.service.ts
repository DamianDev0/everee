import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkerRepository } from '@modules/payroll/worker/repositories/worker.repository';
import { EvereeWorkerService } from '@integrations/everee/services/everee-worker.service';
import { CreateWorkerDto } from '@modules/payroll/worker/dtos/create-worker.dto';
import { UpdateWorkerDto } from '@modules/payroll/worker/dtos/update-worker.dto';
import { Worker } from '@modules/payroll/worker/entities/worker.entity';
import { WorkerStatus, OnboardingStatus } from '@modules/payroll/worker/enums/worker.enum';
import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';
import {
  EvereeCreateWorkerRequest,
  EvereeCreateWorkerResponse,
  EvereeCreateComponentSessionRequest,
  EvereeCreateComponentSessionResponse,
} from '@integrations/everee/interfaces/worker.interface';

@Injectable()
export class WorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly evereeWorkerService: EvereeWorkerService,
  ) {}

  async create(dto: CreateWorkerDto): Promise<Worker> {
    const existing = await this.workerRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException(`Worker with email ${dto.email} already exists`);

    const evereePayload: EvereeCreateWorkerRequest = {
      externalId: `worker-${dto.email}-${Date.now()}`,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      workerType: dto.workerType,
      ssn: dto.ssn,
    };

    const evereeResponse: EvereeCreateWorkerResponse = await this.evereeWorkerService.createWorker(evereePayload);

    const workerData: Partial<Worker> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      workerType: dto.workerType,
      ssn: dto.ssn,
      notes: dto.notes,
      hireDate: evereeResponse.hireDate ? new Date(evereeResponse.hireDate) : undefined,
      externalId: evereeResponse.externalWorkerId,
      evereeWorkerId: evereeResponse.workerId,
      status: WorkerStatus.PENDING_ONBOARDING,
      onboardingStatus: OnboardingStatus.NOT_STARTED,
      syncedWithEveree: true,
    };

    return this.workerRepository.create(workerData);
  }

  async createOnboardingSession(
    workerId: string,
    payload: EvereeCreateComponentSessionRequest,
  ): Promise<{ url: string }> {
    const worker = await this.findById(workerId);
    if (worker.onboardingStatus === OnboardingStatus.COMPLETED) {
      throw new BadRequestException('Worker onboarding already completed');
    }

    const session: EvereeCreateComponentSessionResponse = await this.evereeWorkerService.createOnboardingSession(payload);

    await this.workerRepository.update(worker.id, {
      onboardingStatus: OnboardingStatus.IN_PROGRESS,
      onboardingLinkSentAt: new Date(),
    });

    return { url: session.url };
  }

  async completeOnboarding(
    externalWorkerId: string,
    evereeWorkerId: string,
    workerProfile: any,
  ): Promise<Worker> {
    const worker = await this.workerRepository.findByExternalId(externalWorkerId);
    if (!worker) throw new NotFoundException(`Worker not found with external ID ${externalWorkerId}`);

    const updates: Partial<Worker> = {
      evereeWorkerId,
      onboardingStatus: OnboardingStatus.COMPLETED,
      onboardingCompletedAt: new Date(),
      status: WorkerStatus.ACTIVE,
      lastSyncedWithEvereeAt: new Date(),
      syncedWithEveree: true,
      onboardingData: workerProfile,
    };

    if (workerProfile?.address) {
      updates.address = workerProfile.address.street;
      updates.city = workerProfile.address.city;
      updates.state = workerProfile.address.state;
      updates.zipCode = workerProfile.address.zipCode;
      updates.country = workerProfile.address.country || 'US';
    }

    if (workerProfile?.paymentMethod) updates.paymentMethodDetails = workerProfile.paymentMethod;
    if (workerProfile?.taxInformation) updates.taxInformation = workerProfile.taxInformation;

    return this.workerRepository.update(worker.id, updates);
  }

  async findAll(): Promise<Worker[]> {
    return this.workerRepository.findAll();
  }

  async findById(id: string): Promise<Worker> {
    const worker = await this.workerRepository.findById(id);
    if (!worker) throw new NotFoundException(`Worker with ID ${id} not found`);
    return worker;
  }

  async findWithPagination(paginationDto: PaginationDto): Promise<IPaginationResponse<Worker>> {
    return this.workerRepository.findWithPagination(paginationDto);
  }

  async update(id: string, dto: UpdateWorkerDto): Promise<Worker> {
    const worker = await this.findById(id);
    return this.workerRepository.update(id, {
      ...dto,
      hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
      terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
    });
  }

  async delete(id: string): Promise<void> {
    const worker = await this.findById(id);
    if (worker.syncedWithEveree) throw new BadRequestException('Cannot delete worker synced with Everee');
    await this.workerRepository.delete(id);
  }

  async validateWorkerIsActive(workerId: string): Promise<void> {
    const worker = await this.findById(workerId);
    if (worker.status !== WorkerStatus.ACTIVE) throw new BadRequestException(`Worker is not active: ${worker.status}`);
    if (!worker.evereeWorkerId) throw new BadRequestException('Worker has not completed Everee onboarding');
  }
}
