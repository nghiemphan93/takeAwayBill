export interface Order {
  createdAt: Date;
  orderCode: string;
  price: number;
  paidOnline: boolean;
}
