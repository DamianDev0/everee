import { Module } from '@nestjs/common';
import { EvereeWebhookController } from './controllers/everee-webhook.controller';
import { EvereeWebhookAuthService } from './services/everee-webhook-auth.service';
import { EvereeWebhookHandlerService } from './services/everee-webhook-handler.service';
import { WorkerModule } from '@services/payroll/worker/worker.module';

@Module({
  imports: [WorkerModule],
  controllers: [EvereeWebhookController],
  providers: [EvereeWebhookAuthService, EvereeWebhookHandlerService],
  exports: [EvereeWebhookHandlerService],
})
export class EvereeWebhookModule {}
