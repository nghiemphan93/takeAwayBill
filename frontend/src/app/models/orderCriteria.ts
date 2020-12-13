export interface OrderCriteria {
  createdAt?: string;
  orderCode?: string;
  city?: string;
  price?: string;
  paidOnline?: string;
  sortDirection?: string;
  sortColumn?: string;
  pageIndex?: number;
  pageSize?: number;
}
