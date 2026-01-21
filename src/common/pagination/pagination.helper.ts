export interface PaginationQuery {
    page?: number;
    page_size?: number;
}

export interface PaginationMeta {
    page: number;
    page_size: number;
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
    page_size = 10,
): PaginationResult<T> {
    const totalPages = Math.ceil(total / page_size);

    return {
        results: items,
        meta: {
            page,
            page_size,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}
