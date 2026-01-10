import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as webhookService from './webhook.service';



@Controller('payroll/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: webhookService.WebhookService) {}

  /**
   * POST /payroll/webhooks/everee
   * Receive webhooks from Everee
   */
  @Post('everee')
  @HttpCode(HttpStatus.OK)
  async handleEvereeWebhook(
    @Body() payload: webhookService.EvereeWebhookPayload,
    @Headers('x-everee-signature') signature?: string,
  ) {
    this.logger.log(
      `Received Everee webhook: ${payload.eventType} (ID: ${payload.eventId})`,
    );

    // Validate webhook signature (if Everee provides it)
    if (signature) {
      const isValid = this.webhookService.validateWebhookSignature(
        JSON.stringify(payload),
        signature,
      );

      if (!isValid) {
        this.logger.error('Invalid webhook signature');
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    try {
      await this.webhookService.handleEvereeWebhook(payload);

      return {
        success: true,
        message: 'Webhook processed successfully',
        eventId: payload.eventId,
      };
    } catch (error) {
      this.logger.error('Failed to process webhook', error);
      throw error;
    }
  }
}
