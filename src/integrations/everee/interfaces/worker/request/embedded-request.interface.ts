/**
 * Everee Embedded Components API - Request Interfaces
 * Request payloads for embedded component session management
 */

import { EmbeddedExperience, EmbeddedExperienceVersion } from '../../common/enums';

/**
 * Experience Options for customizing embedded components
 */
export interface EmbeddedExperienceOptions {
  // Onboarding-specific options
  accountSetupEnabled?: boolean;
  brandingEnabled?: boolean;
  onboardingBackButtonEnabled?: boolean | string; // API accepts both boolean and "true"/"false" strings

  // Add other experience-specific options here as needed
  [key: string]: any;
}

/**
 * POST /api/v2/embedded/session
 * Create a Component session for embedded experiences
 */
export interface CreateEmbeddedSessionRequest {
  workerId?: string; // required if externalWorkerId is null
  externalWorkerId?: string; // required if workerId is null
  eventHandlerName: string;
  experience: EmbeddedExperience;
  experienceVersion: EmbeddedExperienceVersion;
  experienceOptions?: EmbeddedExperienceOptions;
}

/**
 * Specific session request types for type safety
 */

export interface CreateOnboardingSessionRequest extends CreateEmbeddedSessionRequest {
  experience: EmbeddedExperience.ONBOARDING;
  experienceVersion: EmbeddedExperienceVersion.V2_0;
}

export interface CreateWorkerHomeSessionRequest extends CreateEmbeddedSessionRequest {
  experience: EmbeddedExperience.WORKER_HOME;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreatePaymentHistorySessionRequest extends CreateEmbeddedSessionRequest {
  experience: EmbeddedExperience.PAYMENT_HISTORY;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreateTaxDocumentsSessionRequest extends CreateEmbeddedSessionRequest {
  experience: EmbeddedExperience.TAX_DOCUMENTS;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreatePaymentDepositSessionRequest extends CreateEmbeddedSessionRequest {
  experience: EmbeddedExperience.PAYMENT_DEPOSIT;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreateHomeAddressSessionRequest extends CreateEmbeddedSessionRequest {
  experience: EmbeddedExperience.HOME_ADDRESS;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}

export interface CreateInstantPaySessionRequest extends CreateEmbeddedSessionRequest {
  experience: EmbeddedExperience.INSTANT_PAY;
  experienceVersion: EmbeddedExperienceVersion.V1_0;
}
