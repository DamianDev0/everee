import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { WorkLocationService } from './work-location.service';
import { EvereeWorkLocationService } from '@integrations/everee/services/everee-work-location.service';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import { WorkLocation } from '@modules/payroll/work-location/entities/work-location.entity';
import { WorkLocationRepository } from '@modules/payroll/work-location/repositories/work-location.repository';
import { WorkLocationController } from './work-location.controller';
import { WorkLocationCreationService, WorkLocationManagementService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkLocation]),
    HttpModule,
    ConfigModule,
  ],
  providers: [
    WorkLocationService,
    WorkLocationCreationService,
    WorkLocationManagementService,
    WorkLocationRepository,
    {
      provide: 'IWorkLocationRepository',
      useClass: WorkLocationRepository,
    },
    EvereeWorkLocationService,
    EvereeHttpClient,
  ],
  exports: [WorkLocationService, WorkLocationRepository, WorkLocationManagementService],
  controllers: [
    WorkLocationController,
  ],
})
export class WorkLocationModule {}
