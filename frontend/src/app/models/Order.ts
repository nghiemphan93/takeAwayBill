export interface Order {
  createdAt: Date;
  orderCode: string;
  city: string;
  price: number;
  paidOnline: boolean;
}
