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
import { CreateShiftDto, UpdateShiftDto } from '@modules/payroll/shift/dtos';
import { ShiftService } from './shift.service';

@Controller('payroll/shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateShiftDto) {
    return this.shiftService.createShift(dto);
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
    return this.shiftService.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftService.updateShift(id, dto);
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
