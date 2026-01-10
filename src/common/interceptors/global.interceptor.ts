import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class GlobalInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;

        return {
          code: statusCode,
          message: this.getDefaultMessage(statusCode),
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      200: 'Success',
      201: 'Created successfully',
      204: 'No content',
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      500: 'Internal server error',
    };

    return messages[statusCode] || 'Success';
  }
}
