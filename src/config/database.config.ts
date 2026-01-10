import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    statement_timeout: 10000,
    idle_in_transaction_session_timeout: 10000,
  },
  connectTimeoutMS: 10000,
  maxQueryExecutionTime: 5000,
  autoLoadEntities: true,
});
