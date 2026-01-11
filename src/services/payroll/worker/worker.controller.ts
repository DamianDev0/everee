import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkerService } from './worker.service';
import { PaginationDto } from '@common/dto/pagination.dto';

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

@Controller('payroll/workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post('onboarding/contractor')
  @HttpCode(HttpStatus.CREATED)
  async createOnboardingContractor(@Body() dto: OnboardingContractorDto) {
    const { worker, evereeResponse } = await this.workerService.createOnboardingContractor(dto);
    return {
      ...worker,
      evereeWorkerId: evereeResponse.workerId,
      onboardingStatus: evereeResponse.onboardingStatus,
      lifecycleStatus: evereeResponse.lifecycleStatus,
    };
  }

  @Post('onboarding/employee')
  @HttpCode(HttpStatus.CREATED)
  async createOnboardingEmployee(@Body() dto: OnboardingEmployeeDto) {
    const { worker, evereeResponse } = await this.workerService.createOnboardingEmployee(dto);
    return {
      ...worker,
      evereeWorkerId: evereeResponse.workerId,
      onboardingStatus: evereeResponse.onboardingStatus,
      lifecycleStatus: evereeResponse.lifecycleStatus,
    };
  }

  @Post('complete/contractor')
  @HttpCode(HttpStatus.CREATED)
  async createCompleteContractor(@Body() dto: CreateCompleteContractorDto) {
    const { worker } = await this.workerService.createCompleteContractor(dto);
    return worker;
  }

  @Post('complete/employee')
  @HttpCode(HttpStatus.CREATED)
  async createCompleteEmployee(@Body() dto: CreateCompleteEmployeeDto) {
    const { worker } = await this.workerService.createCompleteEmployee(dto);
    return worker;
  }

  @Post('embedded/contractor')
  @HttpCode(HttpStatus.CREATED)
  async createEmbeddedContractor(@Body() dto: CreateEmbeddedContractorDto) {
    const { worker } = await this.workerService.createEmbeddedContractor(dto);
    return worker;
  }

  @Post('embedded/employee')
  @HttpCode(HttpStatus.CREATED)
  async createEmbeddedEmployee(@Body() dto: CreateEmbeddedEmployeeDto) {
    const { worker } = await this.workerService.createEmbeddedEmployee(dto);
    return worker;
  }

  @Post(':id/embedded-session')
  @HttpCode(HttpStatus.CREATED)
  async createEmbeddedSession(
    @Param('id') id: string,
    @Body() dto: CreateEmbeddedSessionDto,
  ) {
    return this.workerService.createEmbeddedSession(id, dto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    if (paginationDto.page && paginationDto.limit) {
      return this.workerService.findWithPagination(paginationDto);
    }
    return this.workerService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.workerService.findById(id);
  }

  @Get(':id/everee')
  async getWorkerFromEveree(@Param('id') id: string) {
    return this.workerService.getWorkerFromEveree(id);
  }

  @Patch(':id')
  async updateWorker(
    @Param('id') id: string,
    @Body() dto: UpdateWorkerDto,
  ) {
    return this.workerService.updateWorker(id, dto);
  }

  @Post(':id/terminate')
  @HttpCode(HttpStatus.OK)
  async terminateWorker(
    @Param('id') id: string,
    @Body() dto: TerminateWorkerDto,
  ) {
    return this.workerService.terminateWorker(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWorker(@Param('id') id: string) {
    await this.workerService.deleteWorker(id);
  }
}
