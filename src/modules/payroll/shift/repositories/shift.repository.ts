import { IShiftRepository } from './interfaces/shift.repository.interface';
import { Repository, Between } from 'typeorm';
import { Shift } from '../entities/shift.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShiftStatus } from '../enums/shift.enum';
import { BaseRepository } from '@common/repositories/base.repository';
import { IPaginationResponse, PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class ShiftRepository extends BaseRepository<Shift> implements IShiftRepository {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {
    super(shiftRepository);
  }

  async findAll(): Promise<Shift[]> {
    return await this.shiftRepository.find({
      relations: ['worker', 'workLocation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Shift> {
    return super.findById(id, ['worker', 'workLocation']);
  }

  async findByExternalId(externalId: string): Promise<Shift | null> {
    return await this.shiftRepository.findOne({
      where: { externalId },
      relations: ['worker', 'workLocation'],
    });
  }

  async findByEvereeShiftId(evereeShiftId: string): Promise<Shift | null> {
    return await this.shiftRepository.findOne({
      where: { evereeShiftId },
      relations: ['worker', 'workLocation'],
    });
  }

  async findByWorkerId(workerId: string): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: { workerId },
      relations: ['worker', 'workLocation'],
      order: { shiftStartTime: 'DESC' },
    });
  }

  async findByWorkerIdAndDateRange(
    workerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: {
        workerId,
        shiftStartTime: Between(startDate, endDate),
      },
      relations: ['worker', 'workLocation'],
      order: { shiftStartTime: 'ASC' },
    });
  }

  async findByStatus(status: ShiftStatus): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: { status },
      relations: ['worker', 'workLocation'],
      order: { shiftStartTime: 'DESC' },
    });
  }

  async findPendingApproval(): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: { status: ShiftStatus.SUBMITTED },
      relations: ['worker', 'workLocation'],
      order: { submittedAt: 'ASC' },
    });
  }

  async findByPayPeriod(startDate: Date, endDate: Date): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: {
        payPeriodStartDate: startDate,
        payPeriodEndDate: endDate,
      },
      relations: ['worker', 'workLocation'],
      order: { shiftStartTime: 'ASC' },
    });
  }

  async findWithPagination(
    paginationDto: PaginationDto,
    customizeQueryBuilder?: (qb: any) => any,
  ): Promise<IPaginationResponse<Shift>> {
    return super.findWithPagination(paginationDto, (qb) => {
      qb.leftJoinAndSelect('shift.worker', 'worker')
        .leftJoinAndSelect('shift.workLocation', 'workLocation');

      if (customizeQueryBuilder) {
        qb = customizeQueryBuilder(qb);
      }
      return qb;
    }, 'shift');
  }
}
