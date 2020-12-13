export interface Order {
  createdAt: Date;
  orderCode: string;
  postcode: string;
  price: number;
  paidOnline: boolean;
}
