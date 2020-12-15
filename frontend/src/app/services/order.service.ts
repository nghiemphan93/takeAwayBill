import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {OrderCriteria} from '../models/orderCriteria';
import {HttpClient} from '@angular/common/http';
import {Order} from '../models/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // orderCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    // this.orderCount.next(0);
  }

  getOrders(criteria?: OrderCriteria): Observable<Order[]> {
    // console.log('page Index: ' + criteria?.pageIndex + '   page Size: ' + criteria?.pageSize);

    const formData = new FormData();
    formData.append('date', '2020-11-05');
    formData.append('sortDirection', criteria?.sortDirection || 'asc');
    formData.append('sortColumn', criteria?.sortColumn || 'createdAt');
    // formData.append('pageIndex', (criteria?.pageIndex || 0).toString());
    // formData.append('pageSize', (criteria?.pageSize || 15).toString());

    return this.http.post<Order[]>('http://localhost:5005/getOrdersByDate', formData);
  }

  countPaidOrders(orders: Order[], paidOnline: number): number {
        return orders.filter(order => order.paidOnline === paidOnline).length;
  }

  calcAmountPaidOrders(orders: Order[], paidOnline: number): string {
    return orders.filter(order => order.paidOnline === paidOnline)
      .reduce((sum, order) => sum + order.price, 0).toFixed(2);
  }
}
