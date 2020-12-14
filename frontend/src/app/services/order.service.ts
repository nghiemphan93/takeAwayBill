import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {OrderCriteria} from '../models/orderCriteria';
import {HttpClient} from '@angular/common/http';
import {Order} from '../models/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  orderCount = new BehaviorSubject<number>(0);
  data = [];

  constructor(private http: HttpClient) {
    this.orderCount.next(0);
  }

  getOrders(criteria?: OrderCriteria): Observable<Order[]> {
    console.log('page Index: ' + criteria?.pageIndex + '   page Size: ' + criteria?.pageSize);

    const formData = new FormData();
    formData.append('date', '2020-09-10');
    formData.append('sortDirection', criteria?.sortDirection || 'asc');
    formData.append('sortColumn', criteria?.sortColumn || 'createdAt');
    formData.append('pageIndex', (criteria?.pageIndex || 0).toString());
    formData.append('pageSize', (criteria?.pageSize || 10).toString());

    return this.http.post<Order[]>('http://localhost:5005/getOrdersByDate', formData);
  }
}
