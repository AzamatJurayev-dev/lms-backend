import {CallHandler, ExecutionContext, Injectable, NestInterceptor,} from '@nestjs/common';
import {Observable} from 'rxjs';
import {requestContext} from '../context/request-context';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest<any>();
        const user = req.user;

        return requestContext.run(
            {
                userId: user?.id ? Number(user.id) : undefined,
                role: user?.role,
                companyId: user?.companyId ?? null,
            },
            () => next.handle(),
        );
    }
}
