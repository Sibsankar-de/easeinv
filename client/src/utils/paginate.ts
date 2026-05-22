export interface PageResult<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginate<T>(
  list: T[],
  pageSize: number,
  page: number
): PageResult<T> {
  const totalItems = list.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // clamp page number to valid range
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const items = list.slice(startIndex, endIndex);

  return {
    items,
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}
