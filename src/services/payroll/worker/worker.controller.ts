import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from '@modules/payroll/worker/dtos/create-worker.dto';
import { UpdateWorkerDto } from '@modules/payroll/worker/dtos/update-worker.dto';
import { PaginationDto } from '@common/dto/pagination.dto';

@Controller('payroll/workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  /**
   * POST /payroll/workers
   * Create worker + create Everee worker
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWorkerDto) {
    return this.workerService.create(dto);
  }

  /**
   * POST /payroll/workers/:id/onboarding-session
   * Create Everee onboarding session (redirect URL)
   */
  @Post(':id/onboarding-session')
  async createOnboardingSession(@Param('id') id: string) {
    return this.workerService.createOnboardingSession(id);
  }

  /**
   * GET /payroll/workers
   */
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    if (paginationDto.page && paginationDto.limit) {
      return this.workerService.findWithPagination(paginationDto);
    }
    return this.workerService.findAll();
  }

  /**
   * GET /payroll/workers/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.workerService.findById(id);
  }

  /**
   * PUT /payroll/workers/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkerDto,
  ) {
    return this.workerService.update(id, dto);
  }

  /**
   * DELETE /payroll/workers/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.workerService.delete(id);
  }
}
