export interface OrderCriteria {
  createdAt?: string;
  orderCode?: string;
  postcode?: string;
  price?: string;
  paidOnline?: number;
  sortDirection?: string;
  sortColumn?: string;
  pageIndex?: number;
  pageSize?: number;
}
