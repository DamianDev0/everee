import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';
import { Worker } from '@modules/payroll/worker/entities/worker.entity';
import { WorkerRepository } from '@modules/payroll/worker/repositories/worker.repository';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import { EvereeWorkerService } from '@integrations/everee/services/everee-worker.service';

import {
  OnboardingWorkerService,
  CompleteWorkerService,
  EmbeddedWorkerService,
  WorkerManagementService,
} from './services';

@Module({
  imports: [TypeOrmModule.forFeature([Worker]), HttpModule],
  controllers: [WorkerController],
  providers: [
    WorkerService,
    OnboardingWorkerService,
    CompleteWorkerService,
    EmbeddedWorkerService,
    WorkerManagementService,
    WorkerRepository,
    {
      provide: 'IWorkerRepository',
      useClass: WorkerRepository,
    },
    EvereeHttpClient,
    EvereeWorkerService,
  ],
  exports: [WorkerService, WorkerRepository, WorkerManagementService],
})
export class WorkerModule {}
