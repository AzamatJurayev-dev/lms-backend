import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import {Observable, map} from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        if (request.method !== 'GET') {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => {
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
