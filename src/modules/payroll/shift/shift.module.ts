import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Shift } from './entities/shift.entity';
import { ShiftService } from './shift.service';
import { EvereeShiftService } from '@integrations/everee/services/everee-shift.service';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift]),
    HttpModule,
    ConfigModule,
  ],
  providers: [ShiftService, EvereeShiftService, EvereeHttpClient],
  exports: [ShiftService],
})
export class ShiftModule {}
