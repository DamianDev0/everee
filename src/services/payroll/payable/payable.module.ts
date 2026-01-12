import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { EvereePayableService } from '@integrations/everee/services/everee-payable.service';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import { PayableService } from './payable.service';
import { Payable } from '@modules/payroll/payable/entities/payable.entity';
import { PayableController } from './payable.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payable]),
    HttpModule,
    ConfigModule,
  ],
  providers: [PayableService, EvereePayableService, EvereeHttpClient],
  exports: [PayableService],
  controllers: [PayableController],
})
export class PayableModule {}
