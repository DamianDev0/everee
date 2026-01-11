import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WorkLocation } from './entities/work-location.entity';
import { WorkLocationService } from './work-location.service';
import { EvereeWorkLocationService } from '@integrations/everee/services/everee-work-location.service';
import { EvereeHttpClient } from '@integrations/config/http-everee.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkLocation]),
    HttpModule,
    ConfigModule,
  ],
  providers: [WorkLocationService, EvereeWorkLocationService, EvereeHttpClient],
  exports: [WorkLocationService],
})
export class WorkLocationModule {}
