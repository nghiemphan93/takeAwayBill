import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderCriteria } from '../models/orderCriteria';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/Order';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LiveOrder } from '../models/LiveOrder';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private matSnackBar: MatSnackBar
  ) {}

  getOrders(criteria?: OrderCriteria): Observable<Order[]> {
    const formData = new FormData();
    formData.append('date', criteria?.createdAt || '2020-09-10');
    formData.append('sortDirection', criteria?.sortDirection || 'asc');
    formData.append('sortColumn', criteria?.sortColumn || 'createdAt');

    return this.http.post<Order[]>(
      `${this.authService.getBaseUrl()}/getOrdersByDate`,
      formData
    );
  }

  getLiveOrders(): Observable<LiveOrder[]> {
    return this.http.get<LiveOrder[]>(
      `${this.authService.getBaseUrl()}/getLiveOrders`
    );
  }

  countPaidOrders(orders: Order[], isPaidOnline: number): number {
    if (orders.length > 0) {
      return orders.filter((order) => order.paidOnline === isPaidOnline).length;
    }
    return 0;
  }

  calcRevenues(orders: Order[], paidOnline: number): number {
    if (orders.length > 0) {
      return orders
        .filter((order) => order.paidOnline === paidOnline)
        .reduce((sum, order) => sum + order.price, 0);
    }
    return 0;
  }
}
