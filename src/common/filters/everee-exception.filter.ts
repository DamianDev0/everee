import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AxiosError } from 'axios';

@Catch(AxiosError)
export class EvereeExceptionFilter implements ExceptionFilter {
  catch(exception: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const evereeError = exception.response?.data as any;
    const status = exception.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      code: status,
      message: evereeError?.errorMessage || exception.message || 'Error with Everee API',
      data: null,
      error: {
        evereeErrorCode: evereeError?.errorCode,
        details: evereeError?.errorMessage,
        path: evereeError?.path,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
