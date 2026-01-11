import { Injectable } from '@nestjs/common';
import { Worker } from '@modules/payroll/worker/entities/worker.entity';
import {
  PaginationDto,
  IPaginationResponse,
} from '@common/dto/pagination.dto';


import {
  OnboardingContractorDto,
  OnboardingEmployeeDto,
} from '@modules/payroll/worker/dtos/onboarding';
import {
  CreateCompleteContractorDto,
  CreateCompleteEmployeeDto,
} from '@modules/payroll/worker/dtos/complete';
import {
  CreateEmbeddedContractorDto,
  CreateEmbeddedEmployeeDto,
  CreateEmbeddedSessionDto,
} from '@modules/payroll/worker/dtos/embedded';
import {
  UpdateWorkerDto,
  TerminateWorkerDto,
} from '@modules/payroll/worker/dtos/management';

import {
  OnboardingContractorResponse,
  OnboardingEmployeeResponse,
  CreateCompleteContractorResponse,
  CreateCompleteEmployeeResponse,
  EmbeddedContractorResponse,
  EmbeddedEmployeeResponse,
  CreateEmbeddedSessionResponse,
  GetWorkerResponse,
} from '@integrations/everee/interfaces/worker';
import { CompleteWorkerService, EmbeddedWorkerService, OnboardingWorkerService, WorkerManagementService } from './services';

@Injectable()
export class WorkerService {
  constructor(
    private readonly onboardingService: OnboardingWorkerService,
    private readonly completeService: CompleteWorkerService,
    private readonly embeddedService: EmbeddedWorkerService,
    private readonly managementService: WorkerManagementService,
  ) {}

  async createOnboardingContractor(
    dto: OnboardingContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: OnboardingContractorResponse }> {
    return this.onboardingService.createOnboardingContractor(dto);
  }

  async createOnboardingEmployee(
    dto: OnboardingEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: OnboardingEmployeeResponse }> {
    return this.onboardingService.createOnboardingEmployee(dto);
  }

  async createCompleteContractor(
    dto: CreateCompleteContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: CreateCompleteContractorResponse }> {
    return this.completeService.createCompleteContractor(dto);
  }

  async createCompleteEmployee(
    dto: CreateCompleteEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: CreateCompleteEmployeeResponse }> {
    return this.completeService.createCompleteEmployee(dto);
  }

  async createEmbeddedContractor(
    dto: CreateEmbeddedContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: EmbeddedContractorResponse }> {
    return this.embeddedService.createEmbeddedContractor(dto);
  }

  async createEmbeddedEmployee(
    dto: CreateEmbeddedEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: EmbeddedEmployeeResponse }> {
    return this.embeddedService.createEmbeddedEmployee(dto);
  }

  async createEmbeddedSession(
    workerId: string,
    dto: CreateEmbeddedSessionDto,
  ): Promise<CreateEmbeddedSessionResponse> {
    return this.embeddedService.createEmbeddedSession(workerId, dto);
  }

  async getWorkerFromEveree(workerId: string): Promise<GetWorkerResponse> {
    return this.managementService.getWorkerFromEveree(workerId);
  }

  async updateWorker(id: string, dto: UpdateWorkerDto): Promise<Worker> {
    return this.managementService.updateWorker(id, dto);
  }

  async terminateWorker(id: string, dto: TerminateWorkerDto): Promise<Worker> {
    return this.managementService.terminateWorker(id, dto);
  }

  async deleteWorker(id: string): Promise<void> {
    return this.managementService.deleteWorker(id);
  }

  async findAll(): Promise<Worker[]> {
    return this.managementService.findAll();
  }

  async findById(id: string): Promise<Worker> {
    return this.managementService.findById(id);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<Worker>> {
    return this.managementService.findWithPagination(paginationDto);
  }

  async validateWorkerIsActive(workerId: string): Promise<void> {
    return this.managementService.validateWorkerIsActive(workerId);
  }

  async handleOnboardingComplete(
    externalWorkerId: string,
    evereeWorkerId: string,
    workerProfile: any,
  ): Promise<Worker> {
    return this.managementService.handleOnboardingComplete(
      externalWorkerId,
      evereeWorkerId,
      workerProfile,
    );
  }
}
