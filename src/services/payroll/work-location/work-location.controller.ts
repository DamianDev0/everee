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

import { PaginationDto } from '@common/dto/pagination.dto';
import { CreateWorkLocationDto } from '@modules/payroll/work-location/dtos/create-work-location.dto';
import { WorkLocationService } from './work-location.service';
import { UpdateWorkLocationDto } from '@modules/payroll/work-location/dtos/update-work-location.dto';

@Controller('payroll/work-locations')
export class WorkLocationController {
  constructor(private readonly workLocationService: WorkLocationService) {}

  /**
   * POST /payroll/work-locations
   * Create a new work location
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWorkLocationDto) {
    return this.workLocationService.create(dto);
  }

  /**
   * GET /payroll/work-locations
   * Get all work locations or paginated list
   */
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    if (paginationDto.page && paginationDto.limit) {
      return this.workLocationService.findWithPagination(paginationDto);
    }
    return this.workLocationService.findAll();
  }

  /**
   * GET /payroll/work-locations/active
   * Get all active work locations
   */
  @Get('active')
  async findActiveLocations() {
    return this.workLocationService.findActiveLocations();
  }

  /**
   * GET /payroll/work-locations/state/:stateAbbreviation
   * Get all work locations for a specific state
   */
  @Get('state/:stateAbbreviation')
  async findByState(@Param('stateAbbreviation') stateAbbreviation: string) {
    return this.workLocationService.findByState(stateAbbreviation);
  }

  /**
   * GET /payroll/work-locations/:id
   * Get work location by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.workLocationService.findById(id);
  }

  /**
   * PUT /payroll/work-locations/:id
   * Update work location
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkLocationDto,
  ) {
    return this.workLocationService.update(id, dto);
  }

  /**
   * DELETE /payroll/work-locations/:id
   * Delete work location
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.workLocationService.delete(id);
  }
}
