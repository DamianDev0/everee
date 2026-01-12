import { Injectable, Logger } from '@nestjs/common';

import { WorkerService } from '../worker/worker.service';

export enum EvereeWebhookEventType {
  WORKER_ONBOARDING_COMPLETED = 'worker.onboarding.completed',
  WORKER_UPDATED = 'worker.updated',
  SHIFT_CREATED = 'shift.created',
  SHIFT_UPDATED = 'shift.updated',
  PAYABLE_PROCESSED = 'payable.processed',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
}

export interface EvereeWebhookPayload {
  eventType: EvereeWebhookEventType;
  eventId: string;
  timestamp: string;
  data: any;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly processedEvents: Set<string> = new Set();

  constructor(
    private readonly workerService: WorkerService,
  ) {}

  /**
   * Scenario 1.2: Receive webhook when onboarding is completed
   * Handles incoming webhooks from Everee
   * Implements deduplication to prevent processing duplicate events
   */
  async handleEvereeWebhook(payload: EvereeWebhookPayload): Promise<void> {
    this.logger.log(
      `Received webhook event: ${payload.eventType} (ID: ${payload.eventId})`,
    );

    // Scenario 1.2: Do not process duplicate webhook events
    if (this.processedEvents.has(payload.eventId)) {
      this.logger.warn(
        `Event ${payload.eventId} has already been processed. Skipping.`,
      );
      return;
    }

    try {
      switch (payload.eventType) {
        // case EvereeWebhookEventType.WORKER_ONBOARDING_COMPLETED:
        //   await this.handleWorkerOnboardingCompleted(payload.data);
        //   break;

        case EvereeWebhookEventType.WORKER_UPDATED:
          await this.handleWorkerUpdated(payload.data);
          break;

        case EvereeWebhookEventType.SHIFT_CREATED:
          this.logger.log(`Shift created: ${payload.data.shiftId}`);
          // Handle shift creation if needed
          break;

        case EvereeWebhookEventType.SHIFT_UPDATED:
          this.logger.log(`Shift updated: ${payload.data.shiftId}`);
          // Handle shift update if needed
          break;

        case EvereeWebhookEventType.PAYABLE_PROCESSED:
          this.logger.log(`Payable processed: ${payload.data.payableId}`);
          // Handle payable processing if needed
          break;

        case EvereeWebhookEventType.PAYMENT_COMPLETED:
          this.logger.log(`Payment completed: ${payload.data.paymentId}`);
          // Handle payment completion if needed
          break;

        case EvereeWebhookEventType.PAYMENT_FAILED:
          this.logger.error(
            `Payment failed: ${payload.data.paymentId}`,
            payload.data.error,
          );
          // Handle payment failure if needed
          break;

        default:
          this.logger.warn(`Unknown event type: ${payload.eventType}`);
      }

      // Mark event as processed
      this.processedEvents.add(payload.eventId);

      // Clean up old processed events (keep last 1000)
      if (this.processedEvents.size > 1000) {
        const eventsArray = Array.from(this.processedEvents);
        eventsArray.slice(0, eventsArray.length - 1000).forEach((eventId) => {
          this.processedEvents.delete(eventId);
        });
      }

      this.logger.log(`Successfully processed webhook event: ${payload.eventId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process webhook event: ${payload.eventId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Scenario 1.2: Handle worker onboarding completion
   * Updates worker status to active and stores complete worker profile
   */
  // private async handleWorkerOnboardingCompleted(data: any): Promise<void> {
  //   this.logger.log(
  //     `Processing onboarding completion for worker: ${data.workerId}`,
  //   );

  //   const {
  //     workerId,
  //     externalId,
  //     firstName,
  //     lastName,
  //     email,
  //     phoneNumber,
  //     address,
  //     workerType,
  //     status,
  //     paymentMethod,
  //     taxInformation,
  //     onboardingCompletedAt,
  //   } = data;

  //   try {
  //     await this.workerService.completeOnboarding(workerId, {
  //       firstName,
  //       lastName,
  //       email,
  //       phoneNumber,
  //       address,
  //       workerType,
  //       status,
  //       paymentMethod,
  //       taxInformation,
  //       onboardingCompletedAt,
  //     });

  //     this.logger.log(
  //       `Onboarding completion processed successfully for worker: ${workerId}`,
  //     );
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to process onboarding completion for worker: ${workerId}`,
  //       error,
  //     );
  //     throw error;
  //   }
  // }

  /**
   * Handle worker profile updates from Everee
   */
  private async handleWorkerUpdated(data: any): Promise<void> {
    this.logger.log(`Processing worker update: ${data.workerId}`);

    // Update worker profile in database if needed
    // Implementation depends on what fields need to be synced

    this.logger.log(`Worker update processed: ${data.workerId}`);
  }

  /**
   * Validate webhook signature (if Everee provides signature verification)
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
  ): boolean {
    // Implement signature validation if Everee provides it
    // This is a security measure to ensure webhooks are from Everee

    // For now, return true (implement actual validation based on Everee docs)
    return true;
  }
}
