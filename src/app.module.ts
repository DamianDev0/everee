import { Module } from '@nestjs/common';
import { getDatabaseConfig } from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollModule } from '@services/payroll/payroll.module';
import { EvereeWebhookModule } from '@integrations/everee/everee-webhook.module';
import evereeConfig from './config/everee.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [evereeConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    PayrollModule,
    EvereeWebhookModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
