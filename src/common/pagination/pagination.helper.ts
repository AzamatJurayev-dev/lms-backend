export interface PaginationQuery {
    page?: number;
    pageSize?: number;
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginationResult<T> {
    results: T[];
    meta: PaginationMeta;
}

export function paginate<T>(
    items: T[],
    total: number,
    page = 1,
    pageSize = 10,
): PaginationResult<T> {
    const totalPages = Math.ceil(total / pageSize);

    return {
        results: items,
        meta: {
            page,
            pageSize,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}
