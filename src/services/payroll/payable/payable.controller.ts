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
import { PayableService } from './payable.service';
import { CreatePayableDto } from '@modules/payroll/payable/dtos/create-payable.dto';
import { ApprovePayableDto } from '@modules/payroll/payable/dtos/approve-payable.dto';
import { RejectPayableDto } from '@modules/payroll/payable/dtos/reject-payable.dto';
import { UpdatePayableDto } from '@modules/payroll/payable/dtos/update-payable.dto';

@Controller('payroll/payables')
export class PayableController {
  constructor(private readonly payableService: PayableService) {}

  /**
   * POST /payroll/payables
   * Create a new payable
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePayableDto) {
    return this.payableService.create(dto);
  }

  /**
   * POST /payroll/payables/approve
   * Approve a payable
   */
  @Post('approve')
  async approve(@Body() dto: ApprovePayableDto) {
    return this.payableService.approve(dto);
  }

  /**
   * POST /payroll/payables/reject
   * Reject a payable
   */
  @Post('reject')
  async reject(@Body() dto: RejectPayableDto) {
    return this.payableService.reject(dto);
  }

  /**
   * POST /payroll/payables/process
   * Process all approved payables for payout
   */
  @Post('process')
  async processApprovedPayables() {
    return this.payableService.processApprovedPayables();
  }

  /**
   * GET /payroll/payables
   * Get all payables or paginated list
   */
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    if (paginationDto.page && paginationDto.limit) {
      return this.payableService.findWithPagination(paginationDto);
    }
    return this.payableService.findAll();
  }

  /**
   * GET /payroll/payables/pending-approval
   * Get all payables pending approval
   */
  @Get('pending-approval')
  async findPendingApproval() {
    return this.payableService.findPendingApproval();
  }

  /**
   * GET /payroll/payables/worker/:workerId
   * Get all payables for a specific worker
   */
  @Get('worker/:workerId')
  async findByWorkerId(@Param('workerId') workerId: string) {
    return this.payableService.findByWorkerId(workerId);
  }

  /**
   * GET /payroll/payables/:id
   * Get payable by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.payableService.findById(id);
  }

  /**
   * PUT /payroll/payables/:id
   * Update payable
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePayableDto) {
    return this.payableService.update(id, dto);
  }

  /**
   * DELETE /payroll/payables/:id
   * Delete payable
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.payableService.delete(id);
  }
}
