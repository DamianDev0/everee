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
  OnboardingContractorDto,
  OnboardingEmployeeDto,
} from '@modules/payroll/worker/dtos/onboarding';
import {
  OnboardingContractorResponse,
  OnboardingEmployeeResponse,
} from '@integrations/everee/interfaces/response';

@Injectable()
export class OnboardingWorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly evereeWorkerService: EvereeWorkerService,
  ) {}

  async createOnboardingContractor(
    dto: OnboardingContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: OnboardingContractorResponse }> {
    await this.validateWorkerDoesNotExist(dto.email);

    const evereeRequest = WorkerMapper.toOnboardingContractorRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createOnboardingContractor(evereeRequest);

    const workerData: Partial<Worker> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      workerType: WorkerType.CONTRACTOR,
      externalId: evereeResponse.externalWorkerId || dto.externalWorkerId,
      evereeWorkerId: evereeResponse.workerId,
      hireDate: new Date(dto.hireDate),
      status: WorkerStatus.PENDING_ONBOARDING,
      onboardingStatus: OnboardingStatus.NOT_STARTED,
      syncedWithEveree: true,
    };

    const worker = await this.workerRepository.create(workerData);
    return { worker, evereeResponse };
  }

  async createOnboardingEmployee(
    dto: OnboardingEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: OnboardingEmployeeResponse }> {
    await this.validateWorkerDoesNotExist(dto.email);

    const evereeRequest = WorkerMapper.toOnboardingEmployeeRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createOnboardingEmployee(evereeRequest);

    const workerData: Partial<Worker> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      workerType: WorkerType.EMPLOYEE,
      externalId: evereeResponse.externalWorkerId || dto.externalWorkerId,
      evereeWorkerId: evereeResponse.workerId,
      hireDate: new Date(dto.hireDate),
      status: WorkerStatus.PENDING_ONBOARDING,
      onboardingStatus: OnboardingStatus.NOT_STARTED,
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
