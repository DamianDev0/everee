import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { EvereeWebhookAuthService } from '../webhooks/everee-webhook-auth.service';
import { EvereeWebhookHandlerService } from '../webhooks/everee-webhook-handler.service';
import type { WebhookPayloadEnvelope } from '../interfaces/webhook/webhook-event.interface';

@Controller('webhooks/everee')
export class EvereeWebhookController {
  private readonly logger = new Logger(EvereeWebhookController.name);
  private readonly processedEventIds = new Set<string>();

  constructor(
    private readonly webhookAuthService: EvereeWebhookAuthService,
    private readonly webhookHandlerService: EvereeWebhookHandlerService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-everee-webhook-signature') signature: string,
    @Headers('x-everee-webhook-timestamp') timestamp: string,
    @Body() payload: WebhookPayloadEnvelope,
  ): Promise<{ received: boolean }> {
    this.logger.log(`Received webhook event: ${payload.type} (ID: ${payload.id})`);

    if (this.processedEventIds.has(payload.id)) {
      this.logger.warn(`Duplicate event received: ${payload.id}, skipping`);
      return { received: true };
    }

    const rawBody = req.rawBody?.toString('utf-8') || JSON.stringify(payload);

    const isValid = this.webhookAuthService.verifyWebhookSignature(
      signature,
      timestamp,
      rawBody,
    );

    if (!isValid) {
      this.logger.error(`Invalid webhook signature for event: ${payload.id}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.processedEventIds.add(payload.id);

    setImmediate(async () => {
      try {
        await this.webhookHandlerService.handleWebhookEvent(payload);
      } catch (error) {
        this.logger.error(`Error processing webhook ${payload.id}:`, error.stack);
      }
    });

    return { received: true };
  }
}
