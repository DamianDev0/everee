import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { ShiftService } from './shift.service';
import { EvereeShiftService } from '@integrations/everee/services/everee-shift.service';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';
import { ShiftRepository } from '@modules/payroll/shift/repositories/shift.repository';
import { ShiftController } from './shift.controller';
import { ShiftCreationService, ShiftManagementService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift]),
    HttpModule,
    ConfigModule,
  ],
  providers: [
    ShiftService,
    ShiftCreationService,
    ShiftManagementService,
    ShiftRepository,
    {
      provide: 'IShiftRepository',
      useClass: ShiftRepository,
    },
    EvereeShiftService,
    EvereeHttpClient,
  ],
  exports: [ShiftService, ShiftRepository, ShiftManagementService],
  controllers: [ShiftController],
})
export class ShiftModule {}
