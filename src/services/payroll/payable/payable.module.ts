import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { EvereePayableService } from '@integrations/everee/services/everee-payable.service';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import { PayableService } from './payable.service';
import { Payable } from '@modules/payroll/payable/entities/payable.entity';
import { PayableRepository } from '@modules/payroll/payable/repositories/payable.repository';
import { PayableController } from './payable.controller';
import { PayableCreationService, PayableManagementService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payable]),
    HttpModule,
    ConfigModule,
  ],
  providers: [
    PayableService,
    PayableCreationService,
    PayableManagementService,
    PayableRepository,
    {
      provide: 'IPayableRepository',
      useClass: PayableRepository,
    },
    EvereePayableService,
    EvereeHttpClient,
  ],
  exports: [PayableService, PayableRepository, PayableManagementService],
  controllers: [PayableController],
})
export class PayableModule {}
