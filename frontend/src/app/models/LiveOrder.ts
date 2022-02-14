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
  status: LiveOrderStatus;
}

export enum LiveOrderStatus {
  CONFIRMED = 'confirmed',
  KITCHEN = 'kitchen',
  DELIVERED = 'delivered',
  IN_DELIVERY = 'in_delivery',
}
