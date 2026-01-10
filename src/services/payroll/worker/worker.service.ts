import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WorkerRepository } from '@modules/payroll/worker/repositories/worker.repository';
import { EvereeWorkerService } from '@integrations/everee/services/everee-worker.service';
import { Worker } from '@modules/payroll/worker/entities/worker.entity';
import {
  WorkerType,
  WorkerStatus,
  OnboardingStatus,
} from '@modules/payroll/worker/enums/worker.enum';
import {
  PaginationDto,
  IPaginationResponse,
} from '@common/dto/pagination.dto';
import { WorkerMapper } from './mappers/worker.mapper';

// DTOs - Onboarding (minimal data)
import {
  OnboardingContractorDto,
  OnboardingEmployeeDto,
} from '@modules/payroll/worker/dtos/onboarding';

// DTOs - Complete (full data)
import {
  CreateCompleteContractorDto,
  CreateCompleteEmployeeDto,
} from '@modules/payroll/worker/dtos/complete';

// DTOs - Embedded
import {
  CreateEmbeddedContractorDto,
  CreateEmbeddedEmployeeDto,
  CreateEmbeddedSessionDto,
} from '@modules/payroll/worker/dtos/embedded';

// DTOs - Management
import {
  UpdateWorkerDto,
  TerminateWorkerDto,
} from '@modules/payroll/worker/dtos/management';

// Response types
import {
  OnboardingContractorResponse,
  OnboardingEmployeeResponse,
  CreateCompleteContractorResponse,
  CreateCompleteEmployeeResponse,
  EmbeddedContractorResponse,
  EmbeddedEmployeeResponse,
  CreateEmbeddedSessionResponse,
  GetWorkerResponse,
} from '@integrations/everee/interfaces/response';

/**
 * WorkerService
 * Supports:
 * - Onboarding flows (minimal data)
 * - Complete worker creation (full data)
 * - Embedded components
 * - Worker management (update, terminate, delete)
 */
@Injectable()
export class WorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly evereeWorkerService: EvereeWorkerService,
  ) {}



  /**
   * Create contractor with onboarding flow
   * Minimal data required - Everee captures the rest
   */
  async createOnboardingContractor(
    dto: OnboardingContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: OnboardingContractorResponse }> {
    // Check if worker already exists
    const existing = await this.workerRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `Worker with email ${dto.email} already exists`,
      );
    }

    // Create worker in Everee
    const evereeRequest = WorkerMapper.toOnboardingContractorRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createOnboardingContractor(evereeRequest);

    // Create worker in local database
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

  /**
   * Create employee with onboarding flow
   * Minimal data required - Everee captures the rest
   */
  async createOnboardingEmployee(
    dto: OnboardingEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: OnboardingEmployeeResponse }> {
    // Check if worker already exists
    const existing = await this.workerRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `Worker with email ${dto.email} already exists`,
      );
    }

    // Create worker in Everee
    const evereeRequest = WorkerMapper.toOnboardingEmployeeRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createOnboardingEmployee(evereeRequest);

    // Create worker in local database
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

  /**
   * ==========================================
   * COMPLETE WORKER CREATION (Full Data)
   * ==========================================
   */

  /**
   * Create complete contractor record
   * All data provided - no additional onboarding needed
   */
  async createCompleteContractor(
    dto: CreateCompleteContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: CreateCompleteContractorResponse }> {
    // Check if worker already exists
    const existing = await this.workerRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `Worker with email ${dto.email} already exists`,
      );
    }

    // Create worker in Everee
    const evereeRequest = WorkerMapper.toCompleteContractorRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createCompleteContractor(evereeRequest);

    // Create worker in local database
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

  /**
   * Create complete employee record
   * All data provided - no additional onboarding needed
   */
  async createCompleteEmployee(
    dto: CreateCompleteEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: CreateCompleteEmployeeResponse }> {
    // Check if worker already exists
    const existing = await this.workerRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `Worker with email ${dto.email} already exists`,
      );
    }

    // Create worker in Everee
    const evereeRequest = WorkerMapper.toCompleteEmployeeRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createCompleteEmployee(evereeRequest);

    // Create worker in local database
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

  /**
   * ==========================================
   * EMBEDDED COMPONENTS
   * ==========================================
   */

  /**
   * Create contractor for embedded onboarding
   * Worker completes the rest via embedded component
   */
  async createEmbeddedContractor(
    dto: CreateEmbeddedContractorDto,
  ): Promise<{ worker: Worker; evereeResponse: EmbeddedContractorResponse }> {
    // Check if worker already exists
    const existing = await this.workerRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `Worker with email ${dto.email} already exists`,
      );
    }

    // Create worker in Everee
    const evereeRequest = WorkerMapper.toEmbeddedContractorRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createEmbeddedContractor(evereeRequest);

    // Create worker in local database
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

  /**
   * Create employee for embedded onboarding
   * Worker completes the rest via embedded component
   */
  async createEmbeddedEmployee(
    dto: CreateEmbeddedEmployeeDto,
  ): Promise<{ worker: Worker; evereeResponse: EmbeddedEmployeeResponse }> {
    // Check if worker already exists
    const existing = await this.workerRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `Worker with email ${dto.email} already exists`,
      );
    }

    // Create worker in Everee
    const evereeRequest = WorkerMapper.toEmbeddedEmployeeRequest(dto);
    const evereeResponse =
      await this.evereeWorkerService.createEmbeddedEmployee(evereeRequest);

    // Create worker in local database
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

  /**
   * Create embedded component session
   * Returns URL to open in web view for worker to complete onboarding/access features
   */
  async createEmbeddedSession(
    workerId: string,
    dto: CreateEmbeddedSessionDto,
  ): Promise<CreateEmbeddedSessionResponse> {
    const worker = await this.findById(workerId);

    // Use worker's Everee ID or external ID
    const sessionRequest = WorkerMapper.toEmbeddedSessionRequest({
      ...dto,
      workerId: worker.evereeWorkerId,
      externalWorkerId: dto.externalWorkerId || worker.externalId,
    });

    const session =
      await this.evereeWorkerService.createEmbeddedSession(sessionRequest);

    // Update tracking info
    if (dto.experience === 'ONBOARDING') {
      await this.workerRepository.update(worker.id, {
        onboardingStatus: OnboardingStatus.IN_PROGRESS,
        onboardingLinkSentAt: new Date(),
      });
    }

    return session;
  }

  /**
   * ==========================================
   * WORKER MANAGEMENT
   * ==========================================
   */

  /**
   * Get worker from Everee by ID
   */
  async getWorkerFromEveree(workerId: string): Promise<GetWorkerResponse> {
    const worker = await this.findById(workerId);
    if (!worker.evereeWorkerId) {
      throw new BadRequestException('Worker has no Everee ID');
    }
    return this.evereeWorkerService.getWorkerById(worker.evereeWorkerId);
  }

  /**
   * Update worker in both local DB and Everee
   */
  async updateWorker(
    id: string,
    dto: UpdateWorkerDto,
  ): Promise<Worker> {
    const worker = await this.findById(id);

    // Update in Everee if synced
    if (worker.syncedWithEveree && worker.evereeWorkerId) {
      const updateRequest = WorkerMapper.toUpdateWorkerRequest(dto);
      await this.evereeWorkerService.updateWorker(
        worker.evereeWorkerId,
        updateRequest,
      );
    }

    // Update in local DB
    return this.workerRepository.update(id, dto);
  }

  /**
   * Terminate worker in both local DB and Everee
   */
  async terminateWorker(
    id: string,
    dto: TerminateWorkerDto,
  ): Promise<Worker> {
    const worker = await this.findById(id);

    // Terminate in Everee if synced
    if (worker.syncedWithEveree && worker.evereeWorkerId) {
      const terminateRequest = WorkerMapper.toTerminateWorkerRequest(dto);
      await this.evereeWorkerService.terminateWorker(
        worker.evereeWorkerId,
        terminateRequest,
      );
    }

    // Update in local DB
    return this.workerRepository.update(id, {
      status: WorkerStatus.TERMINATED,
      terminationDate: new Date(dto.terminationDate),
    });
  }

  /**
   * Delete worker (only if still in onboarding)
   */
  async deleteWorker(id: string): Promise<void> {
    const worker = await this.findById(id);

    if (worker.status !== WorkerStatus.PENDING_ONBOARDING) {
      throw new BadRequestException(
        'Can only delete workers still in onboarding',
      );
    }

    // Delete from Everee if synced
    if (worker.syncedWithEveree && worker.evereeWorkerId) {
      await this.evereeWorkerService.deleteWorker(worker.evereeWorkerId);
    }

    // Delete from local DB
    await this.workerRepository.delete(id);
  }

  /**
   * ==========================================
   * QUERY OPERATIONS
   * ==========================================
   */

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

  /**
   * ==========================================
   * HELPER METHODS
   * ==========================================
   */

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

  /**
   * Handle webhook notification when worker completes onboarding
   */
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
}
