export interface OrderCriteria {
  createdAt?: Date;
  orderCode?: string;
  postcode?: string;
  price?: string;
  paidOnline?: number;
  sortDirection?: string;
  sortColumn?: string;
  pageIndex?: number;
  pageSize?: number;
}
