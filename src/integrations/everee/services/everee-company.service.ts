import { Injectable, Logger } from '@nestjs/common';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';

export interface EvereeCompany {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}


@Injectable()
export class EvereeCompanyService {
  private readonly logger = new Logger(EvereeCompanyService.name);

  constructor(private readonly httpClient: EvereeHttpClient) {}

  async validateConnection(): Promise<EvereeCompany> {
    this.logger.log('Validating Everee connection');
    return this.getCurrentCompany();
  }

  async getCurrentCompany(): Promise<EvereeCompany> {
    const company = await this.httpClient.coreGet<EvereeCompany>(
      '/company',
    );

    this.logger.log(`Everee company loaded: ${company.id}`);

    return company;
  }
}

