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
import { CorrectShiftDto } from '@modules/payroll/shift/dtos/correct-shift.dto';
import { CreateShiftDto } from '@modules/payroll/shift/dtos/create-shift.dto';
import { ShiftService } from './shift.service';
import { UpdateShiftDto } from '@modules/payroll/shift/dtos/update-shift.dto';

@Controller('payroll/shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  /**
   * POST /payroll/shifts
   * Create a new shift
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateShiftDto) {
    return this.shiftService.create(dto);
  }

  /**
   * POST /payroll/shifts/correct
   * Create a correction for a finalized shift
   */
  @Post('correct')
  @HttpCode(HttpStatus.CREATED)
  async correctShift(@Body() dto: CorrectShiftDto) {
    return this.shiftService.correctShift(dto);
  }

  /**
   * GET /payroll/shifts
   * Get all shifts or paginated list
   */
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    if (paginationDto.page && paginationDto.limit) {
      return this.shiftService.findWithPagination(paginationDto);
    }
    return this.shiftService.findAll();
  }

  /**
   * GET /payroll/shifts/pending-approval
   * Get all shifts pending approval
   */
  @Get('pending-approval')
  async findPendingApproval() {
    return this.shiftService.findPendingApproval();
  }

  /**
   * GET /payroll/shifts/worker/:workerId
   * Get all shifts for a specific worker
   */
  @Get('worker/:workerId')
  async findByWorkerId(@Param('workerId') workerId: string) {
    return this.shiftService.findByWorkerId(workerId);
  }

  /**
   * GET /payroll/shifts/:id
   * Get shift by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.shiftService.findById(id);
  }

  /**
   * POST /payroll/shifts/:id/approve
   * Approve a shift
   */
  @Post(':id/approve')
  async approveShift(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.shiftService.approveShift(id, approvedBy);
  }

  /**
   * POST /payroll/shifts/:id/reject
   * Reject a shift
   */
  @Post(':id/reject')
  async rejectShift(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ) {
    return this.shiftService.rejectShift(id, rejectionReason);
  }

  /**
   * PUT /payroll/shifts/:id
   * Update shift
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.shiftService.update(id, dto);
  }

  /**
   * DELETE /payroll/shifts/:id
   * Delete shift
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.shiftService.delete(id);
  }
}
