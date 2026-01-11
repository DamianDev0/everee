import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
  CreateEmbeddedContractorDto,
  CreateEmbeddedEmployeeDto,
  CreateEmbeddedSessionDto,
} from '@modules/payroll/worker/dtos/embedded';
import {
  EmbeddedContractorResponse,
  EmbeddedEmployeeResponse,
  CreateEmbeddedSessionResponse,
} from '@integrations/everee/interfaces/worker';

@Injectable()
export class EmbeddedWorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly evereeWorkerService: EvereeWorkerService,
  ) {}

  async createEmbeddedContractor(
    dto: CreateEmbeddedContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: EmbeddedContractorResponse }> {
    await this.validateWorkerDoesNotExist(dto.email);

    const evereeRequest = WorkerMapper.toEmbeddedContractorRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createEmbeddedContractor(evereeRequest);

    const workerData: Partial<Worker> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      workerType: WorkerType.CONTRACTOR,
      externalId: evereeResponse.externalWorkerId || dto.externalWorkerId,
      evereeWorkerId: evereeResponse.workerId,
      hireDate: new Date(dto.startDate),
      address: dto.homeAddress.line1,
      city: dto.homeAddress.city,
      state: dto.homeAddress.state,
      zipCode: dto.homeAddress.postalCode,
      status: WorkerStatus.PENDING_ONBOARDING,
      onboardingStatus: OnboardingStatus.NOT_STARTED,
      syncedWithEveree: true,
    };

    const worker = await this.workerRepository.create(workerData);
    return { worker, evereeResponse };
  }

  async createEmbeddedEmployee(
    dto: CreateEmbeddedEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: EmbeddedEmployeeResponse }> {
    await this.validateWorkerDoesNotExist(dto.email);

    const evereeRequest = WorkerMapper.toEmbeddedEmployeeRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createEmbeddedEmployee(evereeRequest);

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
      status: WorkerStatus.PENDING_ONBOARDING,
      onboardingStatus: OnboardingStatus.NOT_STARTED,
      syncedWithEveree: true,
    };

    const worker = await this.workerRepository.create(workerData);
    return { worker, evereeResponse };
  }

  async createEmbeddedSession(
    workerId: string,
    dto: CreateEmbeddedSessionDto,
  ): Promise<CreateEmbeddedSessionResponse> {
    const worker = await this.findWorkerById(workerId);

    const sessionRequest = WorkerMapper.toEmbeddedSessionRequest({
      ...dto,
      workerId: worker.evereeWorkerId,
      externalWorkerId: dto.externalWorkerId || worker.externalId,
    });

    const session =
      await this.evereeWorkerService.createEmbeddedSession(sessionRequest);

    if (dto.experience === 'ONBOARDING') {
      await this.workerRepository.update(worker.id, {
        onboardingStatus: OnboardingStatus.IN_PROGRESS,
        onboardingLinkSentAt: new Date(),
      });
    }

    return session;
  }

  private async validateWorkerDoesNotExist(email: string): Promise<void> {
    const existing = await this.workerRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException(`Worker with email ${email} already exists`);
    }
  }

  private async findWorkerById(id: string): Promise<Worker> {
    const worker = await this.workerRepository.findById(id);
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    return worker;
  }
}
