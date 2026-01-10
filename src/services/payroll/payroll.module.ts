import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkerModule } from './worker/worker.module';
import evereeConfig from '@config/everee.config';

@Module({
  imports: [
    ConfigModule.forFeature(evereeConfig),
    WorkerModule,
    // ShiftModule,
    // PayableModule,
    // WorkLocationModule,
    // WebhookModule,
  ],
  exports: [WorkerModule],
})
export class PayrollModule {}
