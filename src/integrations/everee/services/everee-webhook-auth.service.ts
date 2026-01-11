import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EvereeWebhookAuthService {
  private readonly logger = new Logger(EvereeWebhookAuthService.name);
  private readonly webhookSigningKey: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.webhookSigningKey = this.config.get<string>('everee.webhookSigningKey');
    if (!this.webhookSigningKey) {
      this.logger.warn('Everee webhook signing key not configured');
    }
  }

  verifyWebhookSignature(
    signatureHeader: string,
    timestamp: string,
    rawBody: string,
  ): boolean {
    if (!this.webhookSigningKey) {
      this.logger.error('Cannot verify webhook: signing key not configured');
      return false;
    }

    const signatures = this.extractSignatures(signatureHeader);
    if (signatures.length === 0) {
      this.logger.error('No valid v1 signatures found in header');
      return false;
    }

    const message = `${timestamp}.${rawBody}`;
    const computedSignature = this.computeSignature(message);

    const isAuthentic = signatures.some((sig) =>
      this.secureCompare(sig, computedSignature),
    );

    if (!isAuthentic) {
      this.logger.error('Webhook signature verification failed');
    }

    return isAuthentic;
  }

  private extractSignatures(signatureHeader: string): string[] {
    const versionedSignatures = signatureHeader.split(',');
    const signatures: string[] = [];

    for (const versionedSignature of versionedSignatures) {
      const parts = versionedSignature.trim().split('=');
      if (parts.length === 2) {
        const [version, signature] = parts;
        if (version === 'v1') {
          signatures.push(signature);
        }
      }
    }

    return signatures;
  }

  private computeSignature(message: string): string {
    const hmac = crypto.createHmac('sha256', this.webhookSigningKey!);
    hmac.update(message);
    return hmac.digest('hex');
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}
