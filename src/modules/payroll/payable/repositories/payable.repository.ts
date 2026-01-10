import { IPayableRepository } from './interfaces/payable.repository.interface';
import { Repository, IsNull } from 'typeorm';
import { Payable } from '../entities/payable.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PayableStatus, PayableType } from '../enums/payable.enum';
import { BaseRepository } from '@common/repositories/base.repository';
import { IPaginationResponse, PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class PayableRepository extends BaseRepository<Payable> implements IPayableRepository {
  constructor(
    @InjectRepository(Payable)
    private readonly payableRepository: Repository<Payable>,
  ) {
    super(payableRepository);
  }

  async findAll(): Promise<Payable[]> {
    return await this.payableRepository.find({
      relations: ['worker'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Payable> {
    return super.findById(id, ['worker']);
  }

  async findByExternalId(externalId: string): Promise<Payable | null> {
    return await this.payableRepository.findOne({
      where: { externalId },
      relations: ['worker'],
    });
  }

  async findByEvereePayableId(
    evereePayableId: string,
  ): Promise<Payable | null> {
    return await this.payableRepository.findOne({
      where: { evereePayableId },
      relations: ['worker'],
    });
  }

  async findByWorkerId(workerId: string): Promise<Payable[]> {
    return await this.payableRepository.find({
      where: { workerId },
      relations: ['worker'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: PayableStatus): Promise<Payable[]> {
    return await this.payableRepository.find({
      where: { status },
      relations: ['worker'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(type: PayableType): Promise<Payable[]> {
    return await this.payableRepository.find({
      where: { type },
      relations: ['worker'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingApproval(): Promise<Payable[]> {
    return await this.payableRepository.find({
      where: { status: PayableStatus.PENDING_APPROVAL },
      relations: ['worker'],
      order: { createdAt: 'ASC' },
    });
  }

  async findApprovedAndUnprocessed(): Promise<Payable[]> {
    return await this.payableRepository.find({
      where: {
        status: PayableStatus.APPROVED,
        processedAt: IsNull(),
      },
      relations: ['worker'],
      order: { createdAt: 'ASC' },
    });
  }

  async findWithPagination(
    paginationDto: PaginationDto,
    customizeQueryBuilder?: (qb: any) => any,
  ): Promise<IPaginationResponse<Payable>> {
    return super.findWithPagination(paginationDto, (qb) => {
      qb.leftJoinAndSelect('payable.worker', 'worker');

      if (customizeQueryBuilder) {
        qb = customizeQueryBuilder(qb);
      }
      return qb;
    }, 'payable');
  }
}
