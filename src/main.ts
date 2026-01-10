import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/exception-filters/exception.filter';
import { GlobalInterceptor } from '@common/interceptors/global.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useLogger(logger);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

 // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptor
  app.useGlobalInterceptors(new GlobalInterceptor());

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📝 Test Everee connection: http://localhost:${port}/everee/test`);
}

bootstrap();
