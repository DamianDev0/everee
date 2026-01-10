import { Repository, FindOptionsWhere, FindOneOptions, ObjectLiteral } from 'typeorm';
import { IPaginationResponse, PaginationDto } from '@common/dto/pagination.dto';

export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(relations?: string[]): Promise<T[]> {
    return await this.repository.find({
      relations,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async findById(id: string, relations?: string[]): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations,
    } as FindOneOptions<T>);

    if (!entity) {
      throw new Error(`${this.repository.metadata.name} with id ${id} not found`);
    }
    return entity;
  }

  async findWithPagination(
    paginationDto: PaginationDto,
    customizeQueryBuilder?: (qb: any) => any,
    alias?: string,
  ): Promise<IPaginationResponse<T>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const entityAlias = alias || this.repository.metadata.tableName;

    let queryBuilder = this.repository
      .createQueryBuilder(entityAlias)
      .take(limit)
      .skip(skip)
      .orderBy(`${entityAlias}.createdAt`, 'DESC');

    if (customizeQueryBuilder) {
      queryBuilder = customizeQueryBuilder(queryBuilder);
    }

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createDto: Partial<T>): Promise<T> {
    const entity = this.repository.create(createDto as any) as unknown as T;
    return await this.repository.save(entity);
  }

  async update(id: string, updateDto: Partial<T>): Promise<T> {
    const entity = await this.findById(id);
    Object.assign(entity as any, updateDto);
    return await this.repository.save(entity as any);
  }

  async delete(id: string): Promise<any> {
    const entity = await this.findById(id);
    return await this.repository.remove(entity);
  }
}
