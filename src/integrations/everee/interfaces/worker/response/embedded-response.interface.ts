/**
 * Everee Embedded Components API - Response Interfaces
 * Response payloads for embedded component session management
 */

import { EmbeddedExperience, EmbeddedExperienceVersion } from '../../common/enums';
import { EmbeddedExperienceOptions } from '../request/embedded-request.interface';

/**
 * POST /api/v2/embedded/session
 * Response from creating an embedded component session
 */
export interface CreateEmbeddedSessionResponse {
  url: string; // The URL to open in a web view to start the session
  origin: string; // The origin URL for CORS/iframe communication
  expiresInMs: number; // Session expiration time in milliseconds
  experience: EmbeddedExperience;
  experienceVersion: EmbeddedExperienceVersion;
  embeddedOnboardingExperienceType?: 'FULL' | 'LIGHT' | string;
  experienceOptions: EmbeddedExperienceOptions;
  hideEvereeBranding?: boolean;
}

/**
 * Specific session response types for type safety
 */

export interface CreateOnboardingSessionResponse extends CreateEmbeddedSessionResponse {
  experience: EmbeddedExperience.ONBOARDING;
  experienceVersion: EmbeddedExperienceVersion.V2_0;
  embeddedOnboardingExperienceType: 'FULL' | 'LIGHT' | string;
}

export interface CreateWorkerHomeSessionResponse extends CreateEmbeddedSessionResponse {
  experience: EmbeddedExperience.WORKER_HOME;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreatePaymentHistorySessionResponse extends CreateEmbeddedSessionResponse {
  experience: EmbeddedExperience.PAYMENT_HISTORY;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreateTaxDocumentsSessionResponse extends CreateEmbeddedSessionResponse {
  experience: EmbeddedExperience.TAX_DOCUMENTS;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreatePaymentDepositSessionResponse extends CreateEmbeddedSessionResponse {
  experience: EmbeddedExperience.PAYMENT_DEPOSIT;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreateHomeAddressSessionResponse extends CreateEmbeddedSessionResponse {
  experience: EmbeddedExperience.HOME_ADDRESS;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreateInstantPaySessionResponse extends CreateEmbeddedSessionResponse {
  experience: EmbeddedExperience.INSTANT_PAY;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}
