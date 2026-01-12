import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { ShiftService } from './shift.service';
import { EvereeShiftService } from '@integrations/everee/services/everee-shift.service';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';
import { ShiftController } from './shift.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift]),
    HttpModule,
    ConfigModule,
  ],
  providers: [ShiftService, EvereeShiftService, EvereeHttpClient],
  exports: [ShiftService],
  controllers: [ShiftController],
})
export class ShiftModule {}
