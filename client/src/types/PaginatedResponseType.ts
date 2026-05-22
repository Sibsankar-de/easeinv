export type PaginateResponseType<T> = {
  docs: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalDocs: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  nextPage?: number | null;
  prevPage?: number | null;
  pagingCounter?: number;
};
