export const defaultPage: PageableType = {
  page: 1,
  limit: 10,
  totalPages: 0,
  totalDocs: 0,
};

export type PageableType = {
  page: number;
  limit: number;
  totalPages: number;
  totalDocs: number;
};

export type PageState<T> = {
  docs: T[];
  pageable: PageableType;
};

export type PaginatedPages<T> = Record<number, PageState<T>>;

export type PaginatedListData<T> = {
  pages: PaginatedPages<T>;
  totalDocs: number;
  totalPages: number;
};
