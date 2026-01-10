import { Module } from '@nestjs/common';
import { getDatabaseConfig } from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollModule } from '@services/payroll/payroll.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    PayrollModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
