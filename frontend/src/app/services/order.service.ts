import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {OrderCriteria} from '../models/orderCriteria';
import {HttpClient} from '@angular/common/http';
import {Order} from '../models/Order';
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient,
              private authService: AuthService) {
  }

  getOrders(criteria?: OrderCriteria): Observable<Order[]> {
    const formData = new FormData();
    formData.append('date', criteria?.createdAt || '2020-09-10');
    formData.append('sortDirection', criteria?.sortDirection || 'asc');
    formData.append('sortColumn', criteria?.sortColumn || 'createdAt');

    return this.http.post<Order[]>(`${this.authService.getBaseUrl()}/getOrdersByDate`, formData);
  }

  countPaidOrders(orders: Order[], isPaidOnline: number): number {
    if (orders.length > 0) {
      return orders.filter(order => order.paidOnline === isPaidOnline).length;
    }
    return 0;
  }

  calcRevenues(orders: Order[], paidOnline: number): number {
    if (orders.length > 0) {
      return orders.filter(order => order.paidOnline === paidOnline)
        .reduce((sum, order) => sum + order.price, 0);
    }
    return 0;
  }


}
