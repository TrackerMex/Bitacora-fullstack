import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

interface StandardResponse<T> {
  success: boolean;
  path: string;
  timestamp: string;
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        path: request.url,
        timestamp: new Date().toISOString(),
        data,
      })),
    );
  }
}
