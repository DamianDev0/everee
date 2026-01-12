import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { PayableService } from './payable.service';
import { CreatePayableDto } from '@modules/payroll/payable/dtos/create-payable.dto';
import { UpdatePayableDto } from '@modules/payroll/payable/dtos/update-payable.dto';

@Controller('payroll/payables')
export class PayableController {
  constructor(private readonly payableService: PayableService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePayableDto) {
    return this.payableService.createPayable(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async createBulk(@Body() dto: CreatePayableDto[]) {
    return this.payableService.createPayablesBulk(dto);
  }

  @Post('process')
  async processPayablesForPayout(
    @Body()
    body: {
      externalWorkerIds: string[];
      includeWorkersOnRegularPayCycle?: boolean;
    },
  ) {
    return this.payableService.processPayablesForPayout(body);
  }

  @Get('worker/:workerId')
  async findByWorker(@Param('workerId') workerId: string) {
    return this.payableService.listPayablesByWorker(workerId);
  }

  @Get('worker/:workerId/unpaid')
  async findUnpaidByWorker(@Param('workerId') workerId: string) {
    return this.payableService.listUnpaidPayablesByWorker(workerId);
  }

  @Get('external/:externalId')
  async findByExternalId(@Param('externalId') externalId: string) {
    return this.payableService.getPayableByExternalId(externalId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.payableService.getPayableById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePayableDto,
  ) {
    return this.payableService.updatePayable(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.payableService.deletePayable(id);
  }
}
