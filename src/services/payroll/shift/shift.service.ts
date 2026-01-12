import { Injectable } from '@nestjs/common';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';
import { PaginationDto, IPaginationResponse } from '@common/dto/pagination.dto';
import { CreateShiftDto, UpdateShiftDto } from '@modules/payroll/shift/dtos';
import { ShiftResponse } from '@integrations/everee/interfaces/shift';
import { ShiftCreationService, ShiftManagementService } from './services';

@Injectable()
export class ShiftService {
  constructor(
    private readonly creationService: ShiftCreationService,
    private readonly managementService: ShiftManagementService,
  ) {}

  async createShift(
    dto: CreateShiftDto,
  ): Promise<{ shift: Shift; evereeResponse: ShiftResponse }> {
    return this.creationService.createShift(dto);
  }

  async getShiftFromEveree(shiftId: string): Promise<ShiftResponse> {
    return this.managementService.getShiftFromEveree(shiftId);
  }

  async listShiftsByWorker(workerId: string): Promise<Shift[]> {
    return this.managementService.findByWorkerId(workerId);
  }

  async updateShift(id: string, dto: UpdateShiftDto): Promise<Shift> {
    return this.managementService.updateShift(id, dto);
  }

  async deleteShift(id: string, correctionAuthorized = false): Promise<void> {
    return this.managementService.deleteShift(id, correctionAuthorized);
  }

  async findAll(): Promise<Shift[]> {
    return this.managementService.findAll();
  }

  async findById(id: string): Promise<Shift> {
    return this.managementService.findById(id);
  }

  async findByWorkerId(workerId: string): Promise<Shift[]> {
    return this.managementService.findByWorkerId(workerId);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    return this.managementService.findByDateRange(startDate, endDate);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
  ): Promise<IPaginationResponse<Shift>> {
    return this.managementService.findWithPagination(paginationDto);
  }

  async syncShiftFromEveree(evereeShiftId: number): Promise<Shift | null> {
    return this.managementService.syncShiftFromEveree(evereeShiftId);
  }

  async getShiftById(id: string): Promise<Shift> {
    return this.managementService.findById(id);
  }

  async listShiftsByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    return this.managementService.findByDateRange(startDate, endDate);
  }
}
