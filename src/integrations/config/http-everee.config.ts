import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

@Injectable()
export class EvereeHttpClient {
  private readonly logger = new Logger(EvereeHttpClient.name);
  private readonly tenantId: string;
  private readonly authorization: string;
  private readonly coreBaseUrl: string;
  private readonly embedBaseUrl: string;
  private readonly integrationBaseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const apiToken = this.config.get<string>('everee.apiToken');
    const tenantId = this.config.get<string>('everee.tenantId');
    const coreBaseUrl = this.config.get<string>('everee.coreBaseUrl');
    const embedBaseUrl = this.config.get<string>('everee.embedBaseUrl');
    const integrationBaseUrl = this.config.get<string>('everee.integrationBaseUrl');

    if (!apiToken || !tenantId || !coreBaseUrl || !embedBaseUrl || !integrationBaseUrl) {
      throw new Error('Everee configuration is invalid');
    }

    this.tenantId = tenantId;
    this.coreBaseUrl = coreBaseUrl;
    this.embedBaseUrl = embedBaseUrl;
    this.integrationBaseUrl = integrationBaseUrl;
    this.authorization = `Basic ${Buffer.from(apiToken).toString('base64')}`;

    this.logger.log(
      JSON.stringify({
        event: 'EVERREE_CLIENT_INITIALIZED',
        auth:this.authorization
      }),
    );
  }

  async coreGet<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', this.coreBaseUrl, endpoint);
  }

  async corePost<T, B>(endpoint: string, body: B): Promise<T> {
    return this.request<T>('POST', this.coreBaseUrl, endpoint, body);
  }

  async corePut<T, B>(endpoint: string, body: B): Promise<T> {
    return this.request<T>('PUT', this.coreBaseUrl, endpoint, body);
  }

  async corePatch<T, B>(endpoint: string, body: B): Promise<T> {
    return this.request<T>('PATCH', this.coreBaseUrl, endpoint, body);
  }

  async coreDelete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', this.coreBaseUrl, endpoint);
  }

  async embedPost<T, B>(endpoint: string, body: B): Promise<T> {
    return this.request<T>('POST', this.embedBaseUrl, endpoint, body);
  }

  async integrationGet<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', this.integrationBaseUrl, endpoint);
  }

  async integrationPost<T, B>(endpoint: string, body: B): Promise<T> {
    return this.request<T>('POST', this.integrationBaseUrl, endpoint, body);
  }

  async integrationPut<T, B>(endpoint: string, body: B): Promise<T> {
    return this.request<T>('PUT', this.integrationBaseUrl, endpoint, body);
  }

  async integrationDelete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', this.integrationBaseUrl, endpoint);
  }

  private async request<T>(
    method: HttpMethod,
    baseUrl: string,
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    const startedAt = Date.now();

    this.logger.log(
      JSON.stringify({
        event: 'EVEREE_REQUEST_START',
        method,
        url,
        tenantId: this.tenantId,
        body,
      }),
    );

    try {
      const response = await firstValueFrom<AxiosResponse<T>>(
        this.http.request({
          url,
          method,
          data: body,
          headers: {
            Authorization: this.authorization,
            'x-everee-tenant-id': this.tenantId,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }),
      );

      this.logger.log(
        JSON.stringify({
          event: 'EVEREE_REQUEST_SUCCESS',
          method,
          url,
          status: response.status,
          durationMs: Date.now() - startedAt,
          response: response.data,
        }),
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          JSON.stringify({
            event: 'EVEREE_REQUEST_ERROR',
            method,
            url,
            status: error.response?.status ?? 'NO_STATUS',
            durationMs: Date.now() - startedAt,
            response: error.response?.data,
            message: error.message,
          }),
        );
      }
      throw error;
    }
  }
}
