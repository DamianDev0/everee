import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkerModule } from './worker/worker.module';
import evereeConfig from '@config/everee.config';
import { ShiftModule } from './shift/shift.module';
import { WorkLocationModule } from './work-location/work-location.module';
import { PayableModule } from './payable/payable.module';

@Module({
  imports: [
    ConfigModule.forFeature(evereeConfig),
    WorkerModule,
    ShiftModule,
    PayableModule,
    WorkLocationModule,
    // WebhookModule,
  ],
  exports: [WorkerModule],
})
export class PayrollModule {}
