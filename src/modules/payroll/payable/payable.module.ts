import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Payable } from './entities/payable.entity';
import { PayableService } from './payable.service';
import { EvereePayableService } from '@integrations/everee/services/everee-payable.service';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payable]),
    HttpModule,
    ConfigModule,
  ],
  providers: [PayableService, EvereePayableService, EvereeHttpClient],
  exports: [PayableService],
})
export class PayableModule {}
