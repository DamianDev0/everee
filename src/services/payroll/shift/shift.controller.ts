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

import { CreateShiftDto } from '@modules/payroll/shift/dtos/create-shift.dto';
import { UpdateShiftDto } from '@modules/payroll/shift/dtos/update-shift.dto';
import { ShiftService } from './shift.service';

@Controller('payroll/shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateShiftDto) {
    const createData = {
      ...dto,
      shiftStartTime: new Date(dto.shiftStartTime),
      shiftEndTime: new Date(dto.shiftEndTime),
      breaks: dto.breaks?.map(b => ({
        startTime: new Date(b.startTime),
        endTime: new Date(b.endTime),
      })),
    };
    return this.shiftService.createShift(createData);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.shiftService.getShiftById(id);
  }

  @Get('worker/:workerId')
  async findByWorker(@Param('workerId') workerId: string) {
    return this.shiftService.listShiftsByWorker(workerId);
  }

  @Get()
  async findByDateRange(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.shiftService.listShiftsByDateRange(
        new Date(startDate),
        new Date(endDate),
      );
    }
    return [];
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    const updateData = {
      ...dto,
      shiftEndTime: dto.shiftEndTime ? new Date(dto.shiftEndTime) : undefined,
    };
    return this.shiftService.updateShift(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Query('correctionAuthorized') correctionAuthorized?: string,
  ) {
    await this.shiftService.deleteShift(
      id,
      correctionAuthorized === 'true',
    );
  }
}
