import { Module } from '@nestjs/common';
import { EvereeWebhookController } from './controllers/everee-webhook.controller';
import { EvereeWebhookAuthService } from './webhooks/everee-webhook-auth.service';
import { EvereeWebhookHandlerService } from './webhooks/everee-webhook-handler.service';
import { WorkerModule } from '@services/payroll/worker/worker.module';
import { ShiftModule } from '@modules/payroll/shift/shift.module';
import { PayableModule } from '@modules/payroll/payable/payable.module';
import { WorkLocationModule } from '@modules/payroll/work-location/work-location.module';

@Module({
  imports: [WorkerModule, ShiftModule, PayableModule, WorkLocationModule],
  controllers: [EvereeWebhookController],
  providers: [EvereeWebhookAuthService, EvereeWebhookHandlerService],
  exports: [EvereeWebhookHandlerService],
})
export class EvereeWebhookModule {}
