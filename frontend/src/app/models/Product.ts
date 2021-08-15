import { Specification } from './Specification';

export interface Product {
  quantity: number;
  name: string;
  totalAmount: number;
  code: string;
  specifications: Specification[];
}
