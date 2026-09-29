/** Shared shapes used across the app. */

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type StatusFilter = 'active' | 'inactive' | 'all';

export interface ListQuery {
  search: string;
  status: StatusFilter;
  page: number;
  pageSize: number;
}
