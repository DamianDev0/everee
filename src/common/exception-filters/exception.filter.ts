import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AxiosError } from 'axios';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof AxiosError) {
      const evereeError = exception.response?.data as any;
      status = exception.response?.status || HttpStatus.BAD_GATEWAY;
      message = evereeError?.errorMessage || exception.message || 'Error with Everee API';
      errorDetails = {
        source: 'Everee API',
        evereeErrorCode: evereeError?.errorCode,
        details: evereeError?.errorMessage,
        evereePath: evereeError?.path,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errorDetails = {
          details: (exceptionResponse as any).error || (exceptionResponse as any).message,
        };
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorDetails = {
        details: exception.message,
      };
    }

    console.error('Exception caught:', {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      errorDetails,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      code: status,
      message,
      data: null,
      error: errorDetails,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
