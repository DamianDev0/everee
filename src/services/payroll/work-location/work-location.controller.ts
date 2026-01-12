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
import { CreateWorkLocationDto, UpdateWorkLocationDto } from '@modules/payroll/work-location/dtos';
import { WorkLocationService } from './work-location.service';
import { PaginationDto } from '@common/dto/pagination.dto';

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
    @Query() paginationDto?: PaginationDto,
  ) {
    if (paginationDto?.page && paginationDto?.limit) {
      return this.workLocationService.findWithPagination(paginationDto);
    }
    return this.workLocationService.listWorkLocations(
      includeInactive === 'true',
    );
  }

  @Get('state/:stateAbbreviation')
  async findByState(@Param('stateAbbreviation') stateAbbreviation: string) {
    return this.workLocationService.findByState(stateAbbreviation);
  }

  @Get('external/:externalId')
  async findByExternalId(@Param('externalId') externalId: string) {
    return this.workLocationService.findByExternalId(externalId);
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
