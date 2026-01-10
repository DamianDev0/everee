export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class PaginationHelper {
  static paginate<T>(
    items: T[],
    total: number,
    page: number = 1,
    limit: number = 10,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  static getSkip(page: number = 1, limit: number = 10): number {
    return (page - 1) * limit;
  }
}
