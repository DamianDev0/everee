import { Injectable } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import {
  EvereeCreateComponentSessionRequest,
  EvereeCreateComponentSessionResponse,
  EvereeCreateWorkerRequest,
  EvereeCreateWorkerResponse,

} from '../interfaces/worker.interface';

@Injectable()
export class EvereeWorkerService {
  constructor(private readonly httpClient: EvereeHttpClient) {}

  async createOnboardingSession(
    payload: EvereeCreateComponentSessionRequest,
  ): Promise<EvereeCreateComponentSessionResponse> {
    return this.httpClient.embedPost<EvereeCreateComponentSessionResponse, EvereeCreateComponentSessionRequest>(
      '/session',
      payload,
    );
  }

  async createWorker(
    payload: EvereeCreateWorkerRequest,
  ): Promise<EvereeCreateWorkerResponse> {
    return this.httpClient.corePost<EvereeCreateWorkerResponse, EvereeCreateWorkerRequest>(
      '/onboarding/contractor',
      payload,
    );
  }
}
