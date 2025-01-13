export interface IPaginatedResults<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}
