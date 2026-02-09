import { BadRequestException } from '@nestjs/common';

type Order = 'asc' | 'desc';

interface QueryOptions {
  page?: number;
  pageSize?: number;
  ordering?: string;
  search?: string;
  filters?: Record<string, any>;
  date_from?: string;
  date_to?: string;
}

interface BuildQueryOptions {
  allowedOrderFields: readonly string[];
  allowedFilterFields?: readonly string[];
  searchableFields?: readonly string[];
  defaultOrderBy?: Record<string, Order>;
  dateField?: string;
}

export function buildQuery(query: QueryOptions, options: BuildQueryOptions) {
  const page = Math.max(Number(query.page) || 1, 1);
  const pageSize = Math.min(Number(query.pageSize) || 10, 100);
  const skip = (page - 1) * pageSize;
  let orderBy = options.defaultOrderBy;

  if (query.ordering) {
    const isDesc = query.ordering.startsWith('-');
    const field = isDesc ? query.ordering.slice(1) : query.ordering;

    if (!options.allowedOrderFields.includes(field)) {
      throw new BadRequestException(`Invalid ordering field: ${field}`);
    }

    orderBy = { [field]: isDesc ? 'desc' : 'asc' };
  }
  const where: Record<string, any> = {};
  if (options.allowedFilterFields) {
    for (const key of options.allowedFilterFields) {
      if (query.filters?.[key] !== undefined) {
        where[key] = query.filters[key];
      }
    }
  }
  if (query.search && options.searchableFields?.length) {
    where.OR = options.searchableFields.map((field) => ({
      [field]: {
        contains: query.search,
        mode: 'insensitive',
      },
    }));
  }
  if (options.dateField && (query.date_from || query.date_to)) {
    where[options.dateField] = {};

    if (query.date_from) {
      const from = new Date(query.date_from);
      if (isNaN(from.getTime())) {
        throw new BadRequestException('Invalid date_from');
      }
      where[options.dateField].gte = from;
    }

    if (query.date_to) {
      const to = new Date(query.date_to);
      if (isNaN(to.getTime())) {
        throw new BadRequestException('Invalid date_to');
      }
      to.setHours(23, 59, 59, 999);
      where[options.dateField].lte = to;
    }
  }

  return {
    page,
    pageSize,
    skip,
    take: pageSize,
    where,
    orderBy,
  };
}
