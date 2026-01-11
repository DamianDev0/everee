import { Injectable, ConflictException } from '@nestjs/common';
import { WorkerRepository } from '@modules/payroll/worker/repositories/worker.repository';
import { EvereeWorkerService } from '@integrations/everee/services/everee-worker.service';
import { Worker } from '@modules/payroll/worker/entities/worker.entity';
import {
  WorkerType,
  WorkerStatus,
  OnboardingStatus,
} from '@modules/payroll/worker/enums/worker.enum';
import { WorkerMapper } from '../mappers/worker.mapper';
import {
  CreateCompleteContractorDto,
  CreateCompleteEmployeeDto,
} from '@modules/payroll/worker/dtos/complete';
import {
  CreateCompleteContractorResponse,
  CreateCompleteEmployeeResponse,
} from '@integrations/everee/interfaces/worker';

@Injectable()
export class CompleteWorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly evereeWorkerService: EvereeWorkerService,
  ) {}

  async createCompleteContractor(
    dto: CreateCompleteContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: CreateCompleteContractorResponse }> {
    await this.validateWorkerDoesNotExist(dto.email);

    const evereeRequest = WorkerMapper.toCompleteContractorRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createCompleteContractor(evereeRequest);

    const workerData: Partial<Worker> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      workerType: WorkerType.CONTRACTOR,
      externalId: evereeResponse.externalWorkerId || dto.externalWorkerId,
      evereeWorkerId: evereeResponse.workerId,
      hireDate: new Date(dto.hireDate),
      address: dto.homeAddress.line1,
      city: dto.homeAddress.city,
      state: dto.homeAddress.state,
      zipCode: dto.homeAddress.postalCode,
      status: dto.onboardingComplete
        ? WorkerStatus.ACTIVE
        : WorkerStatus.PENDING_ONBOARDING,
      onboardingStatus: dto.onboardingComplete
        ? OnboardingStatus.COMPLETED
        : OnboardingStatus.IN_PROGRESS,
      onboardingCompletedAt: dto.onboardingComplete ? new Date() : undefined,
      syncedWithEveree: true,
    };

    const worker = await this.workerRepository.create(workerData);
    return { worker, evereeResponse };
  }

  async createCompleteEmployee(
    dto: CreateCompleteEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: CreateCompleteEmployeeResponse }> {
    await this.validateWorkerDoesNotExist(dto.email);

    const evereeRequest = WorkerMapper.toCompleteEmployeeRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createCompleteEmployee(evereeRequest);

    const workerData: Partial<Worker> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      workerType: WorkerType.EMPLOYEE,
      externalId: evereeResponse.externalWorkerId || dto.externalWorkerId,
      evereeWorkerId: evereeResponse.workerId,
      hireDate: new Date(dto.hireDate),
      address: dto.homeAddress.line1,
      city: dto.homeAddress.city,
      state: dto.homeAddress.state,
      zipCode: dto.homeAddress.postalCode,
      status: dto.onboardingComplete
        ? WorkerStatus.ACTIVE
        : WorkerStatus.PENDING_ONBOARDING,
      onboardingStatus: dto.onboardingComplete
        ? OnboardingStatus.COMPLETED
        : OnboardingStatus.IN_PROGRESS,
      onboardingCompletedAt: dto.onboardingComplete ? new Date() : undefined,
      syncedWithEveree: true,
    };

    const worker = await this.workerRepository.create(workerData);
    return { worker, evereeResponse };
  }

  private async validateWorkerDoesNotExist(email: string): Promise<void> {
    const existing = await this.workerRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException(`Worker with email ${email} already exists`);
    }
  }
}
