//src\types\User.ts
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  pagination: Pagination;
  data: T[]; 
}



