import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
    userId?: number;
    role?: string;
    companyId?: number | null;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
