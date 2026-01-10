import { Module } from '@nestjs/common';
import { BcryptService } from './services/bcrypt.service';
import { JwtService } from './services/jwt.service';

@Module({
  providers: [BcryptService, JwtService],
  exports: [BcryptService, JwtService],
})
export class CommonModule {}
