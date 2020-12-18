import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {OrderCriteria} from '../models/orderCriteria';
import {HttpClient} from '@angular/common/http';
import {Order} from '../models/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {
  }

  getOrders(criteria?: OrderCriteria): Observable<Order[]> {
    const formData = new FormData();
    formData.append('date', criteria?.createdAt || '2020-09-10');
    formData.append('sortDirection', criteria?.sortDirection || 'asc');
    formData.append('sortColumn', criteria?.sortColumn || 'createdAt');

    return this.http.post<Order[]>('http://localhost:5005/getOrdersByDate', formData);
  }

  savePDF(date: string): void {
    const formData = new FormData();
    formData.append('date', date);
    console.log(formData.get('date'));
    this.http.post('http://localhost:5005/billsPdfByDate', formData);
  }

  countPaidOrders(orders: Order[], isPaidOnline: number): number {
    return orders.filter(order => order.paidOnline === isPaidOnline).length;
  }

  calcRevenues(orders: Order[], paidOnline: number): number {
    return orders.filter(order => order.paidOnline === paidOnline)
      .reduce((sum, order) => sum + order.price, 0);
  }


}
