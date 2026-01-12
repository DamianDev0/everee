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
import { UpdateWorkLocationDto } from '@modules/payroll/work-location/dtos/update-work-location.dto';
import { WorkLocationService } from './work-location.service';

@Controller('payroll/work-locations')
export class WorkLocationController {
  constructor(private readonly workLocationService: WorkLocationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWorkLocationDto) {
    return this.workLocationService.createWorkLocation(dto);
  }

  @Get()
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.workLocationService.listWorkLocations(
      includeInactive === 'true',
    );
  }

  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.workLocationService.listWorkLocationsByClient(clientId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.workLocationService.getWorkLocationById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkLocationDto,
  ) {
    return this.workLocationService.updateWorkLocation(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(@Param('id') id: string) {
    await this.workLocationService.archiveWorkLocation(id);
  }
}
