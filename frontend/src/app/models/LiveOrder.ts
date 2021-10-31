import { Customer } from './Customer';
import { Product } from './Product';

export interface LiveOrder {
  placedDate: Date;
  requestedTime: Date;
  paymentType: string;
  orderCode: string;
  subtotal: number;
  restaurantTotal: number;
  customerTotal: number;
  customer: Customer;
  products: Product[];
  deliveryFree: number;
}
