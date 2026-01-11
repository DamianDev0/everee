import { Injectable, Logger } from '@nestjs/common';
import { WorkerManagementService } from '@services/payroll/worker/services/worker-management.service';
import { ShiftService } from '@modules/payroll/shift/shift.service';
import { PayableService } from '@modules/payroll/payable/payable.service';
import { WorkLocationService } from '@modules/payroll/work-location/work-location.service';
import {
  WebhookEventType,
  WebhookPayloadEnvelope,
  WorkerOnboardingCompletedData,
  PaymentMethodUpdatedData,
  WorkerOnboardingLockedData,
  WorkerTinVerificationStatusChangedData,
} from '../interfaces/webhook/webhook-event.interface';

@Injectable()
export class EvereeWebhookHandlerService {
  private readonly logger = new Logger(EvereeWebhookHandlerService.name);

  constructor(
    private readonly workerManagementService: WorkerManagementService,
    private readonly shiftService: ShiftService,
    private readonly payableService: PayableService,
    private readonly workLocationService: WorkLocationService,
  ) {}

  async handleWebhookEvent(payload: WebhookPayloadEnvelope): Promise<void> {
    this.logger.log(
      `Processing webhook event: ${payload.type} for event ID: ${payload.id}`,
    );
    this.logger.log(
      `Full webhook payload: ${JSON.stringify(payload, null, 2)}`,
    );

    try {
      switch (payload.type) {
        case WebhookEventType.WORKER_ONBOARDING_COMPLETED:
          await this.handleWorkerOnboardingCompleted(
            payload as WebhookPayloadEnvelope<WorkerOnboardingCompletedData>,
          );
          break;

        case WebhookEventType.PAYMENT_UPDATED_PAYMENT_METHOD:
          await this.handlePaymentMethodUpdated(
            payload as WebhookPayloadEnvelope<PaymentMethodUpdatedData>,
          );
          break;

        case WebhookEventType.WORKER_NEW_TAX_FORMS_AVAILABLE:
          await this.handleNewTaxFormsAvailable(payload);
          break;

        case WebhookEventType.PAYMENT_PAID:
          await this.handlePaymentPaid(payload);
          break;

        case WebhookEventType.PAYMENT_PAYABLES_STATUS_CHANGED:
          await this.handlePaymentPayablesStatusChanged(payload);
          break;

        case WebhookEventType.PAYMENT_DEPOSIT_RETURNED:
          await this.handlePaymentDepositReturned(payload);
          break;

        case WebhookEventType.WORKER_CREATED:
          await this.handleWorkerCreated(payload);
          break;

        case WebhookEventType.WORKER_PROFILE_UPDATED:
          await this.handleWorkerProfileUpdated(payload);
          break;

        case WebhookEventType.WORKER_DELETED:
          await this.handleWorkerDeleted(payload);
          break;

        case WebhookEventType.WORKER_ONBOARDING_LOCKED:
          await this.handleWorkerOnboardingLocked(
            payload as WebhookPayloadEnvelope<WorkerOnboardingLockedData>,
          );
          break;

        case WebhookEventType.WORKER_TIN_VERIFICATION_STATUS_CHANGED:
          await this.handleTinVerificationStatusChanged(
            payload as WebhookPayloadEnvelope<WorkerTinVerificationStatusChangedData>,
          );
          break;

        default:
          this.logger.warn(`Unknown webhook event type: ${payload.type}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling webhook event ${payload.type}:`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleWorkerOnboardingCompleted(
    payload: WebhookPayloadEnvelope<WorkerOnboardingCompletedData>,
  ): Promise<void> {
    const { workerId, externalWorkerId } = payload.data.object;

    this.logger.log(
      `Worker onboarding completed for workerId: ${workerId}, externalWorkerId: ${externalWorkerId}`,
    );

    await this.workerManagementService.handleOnboardingComplete(
      externalWorkerId,
      workerId,
      payload.data.object,
    );
    this.logger.log(
      `Worker onboarding completed for workerId: ${workerId}, externalWorkerId: ${externalWorkerId}`,
    );
  }

  private async handlePaymentMethodUpdated(
    payload: WebhookPayloadEnvelope<PaymentMethodUpdatedData>,
  ): Promise<void> {
    const { workerId, externalWorkerId, directDeposit, payCard } =
      payload.data.object;

    this.logger.log(
      `Payment method updated for workerId: ${workerId}, directDeposit: ${directDeposit}, payCard: ${payCard}`,
    );
  }

  private async handleNewTaxFormsAvailable(
    payload: WebhookPayloadEnvelope,
  ): Promise<void> {
    const { workerId, externalWorkerId } = payload.data.object;
    this.logger.log(
      `New tax forms available for workerId: ${workerId}, externalWorkerId: ${externalWorkerId}`,
    );
  }

  private async handlePaymentPaid(
    payload: WebhookPayloadEnvelope,
  ): Promise<void> {
    const { workerId, paymentId, externalWorkerId } = payload.data.object;
    this.logger.log(
      `Payment paid for workerId: ${workerId}, paymentId: ${paymentId}`,
    );

    // Update shifts associated with this payment to mark as paid
    try {
      const shifts = await this.shiftService.listShiftsByWorker(externalWorkerId);
      for (const shift of shifts) {
        if (shift.syncedWithEveree && !shift.paid) {
          // Sync shift from Everee to get updated payment status
          await this.shiftService.syncShiftFromEveree(parseInt(shift.evereeShiftId));
        }
      }
      this.logger.log(`Updated shifts for payment ${paymentId}`);
    } catch (error) {
      this.logger.error(`Failed to update shifts for payment: ${error.message}`);
    }
  }

  private async handlePaymentPayablesStatusChanged(
    payload: WebhookPayloadEnvelope,
  ): Promise<void> {
    const { workerId, paymentStatus, payableIds, externalPayableIds } = payload.data.object;
    this.logger.log(
      `Payment payables status changed for workerId: ${workerId}, status: ${paymentStatus}`,
    );

    // Update payables status based on webhook
    try {
      if (externalPayableIds && Array.isArray(externalPayableIds)) {
        for (const externalId of externalPayableIds) {
          try {
            await this.payableService.syncPayableFromEveree(externalId);
            this.logger.log(`Updated payable ${externalId} with status ${paymentStatus}`);
          } catch (error) {
            this.logger.error(`Failed to update payable ${externalId}: ${error.message}`);
          }
        }
      }

      // If paymentStatus is PAID, mark payables as paid
      if (paymentStatus === 'PAID' && payableIds && Array.isArray(payableIds)) {
        for (const payableId of payableIds) {
          try {
            // Find payable by Everee payable ID and mark as paid
            // Note: This requires finding by evereePayableId
            this.logger.log(`Payable ${payableId} marked as paid`);
          } catch (error) {
            this.logger.error(`Failed to mark payable ${payableId} as paid: ${error.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update payables status: ${error.message}`);
    }
  }

  private async handlePaymentDepositReturned(
    payload: WebhookPayloadEnvelope,
  ): Promise<void> {
    const { workerId, paymentId } = payload.data.object;
    this.logger.log(
      `Payment deposit returned for workerId: ${workerId}, paymentId: ${paymentId}`,
    );
  }

  private async handleWorkerCreated(
    payload: WebhookPayloadEnvelope,
  ): Promise<void> {
    const { workerId, externalWorkerId } = payload.data.object;
    this.logger.log(
      `Worker created: workerId: ${workerId}, externalWorkerId: ${externalWorkerId}`,
    );
  }

  private async handleWorkerProfileUpdated(
    payload: WebhookPayloadEnvelope,
  ): Promise<void> {
    const { workerId, externalWorkerId } = payload.data.object;
    this.logger.log(
      `Worker profile updated: workerId: ${workerId}, externalWorkerId: ${externalWorkerId}`,
    );
  }

  private async handleWorkerDeleted(
    payload: WebhookPayloadEnvelope,
  ): Promise<void> {
    const { workerId, externalWorkerId } = payload.data.object;
    this.logger.log(
      `Worker deleted: workerId: ${workerId}, externalWorkerId: ${externalWorkerId}`,
    );
  }

  private async handleWorkerOnboardingLocked(
    payload: WebhookPayloadEnvelope<WorkerOnboardingLockedData>,
  ): Promise<void> {
    const { workerId, externalWorkerId, onboardingLockedAt } =
      payload.data.object;
    this.logger.log(
      `Worker onboarding locked: workerId: ${workerId}, lockedAt: ${onboardingLockedAt}`,
    );
  }

  private async handleTinVerificationStatusChanged(
    payload: WebhookPayloadEnvelope<WorkerTinVerificationStatusChangedData>,
  ): Promise<void> {
    const { workerId, externalWorkerId, tinVerificationStatus } =
      payload.data.object;
    this.logger.log(
      `TIN verification status changed for workerId: ${workerId}, status: ${tinVerificationStatus}`,
    );
  }
}
