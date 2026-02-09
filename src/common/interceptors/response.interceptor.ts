import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) {
          return data;
        }

        if (
          data &&
          typeof data === 'object' &&
          'results' in data &&
          'meta' in data
        ) {
          return {
            success: true,
            message: 'success',
            results: data.results,
            meta: data.meta,
          };
        }

        return {
          success: true,
          message: 'success',
          results: data,
        };
      }),
    );
  }
}
