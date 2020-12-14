import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {OrderCriteria} from '../models/orderCriteria';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Order} from '../models/Order';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  orderCount = new BehaviorSubject<number>(0);
  data = [];

  constructor(private http: HttpClient) {
    this.orderCount.next(0);
  }

  /**
   * Send Get Request to Server with date as parameter to get orders of the date
   * @param date: formatted as 'YYYY-MM-DD'
   */
  getOrdersByDate(date: string): Observable<Order[]> {
    const formData = new FormData();
    formData.append('date', date);
    return this.http.post<Order[]>('http://localhost:5005/getOrdersByDate', formData)
      .pipe(catchError(err => of(err)));
  }

  getOrders(criteria?: OrderCriteria): Observable<Order[]> {
    console.log('page Index: ' + criteria?.pageIndex + '   page Size: ' + criteria?.pageSize);

    return this.http.post<Order[]>('http://localhost:5005/getOrdersByDate', {
      params: new HttpParams()
        .set('sortDirection', (criteria?.sortDirection || 'asc'))
        .set('sortColumn', (criteria?.sortColumn || 'createdAt'))
        .set('pageIndex', (criteria?.pageIndex || 0).toString())
        .set('pageSize', (criteria?.pageSize || 10).toString())
    });
  }

  // getOrders(criteria?: OrderCriteria): Observable<Order[]> {
  //   console.log('page Index: ' + criteria?.pageIndex + '   page Size: ' + criteria?.pageSize);
  //
  //   const formData = new FormData();
  //   formData.append('date', '2020-09-10'); // TODO: the date value should be got from the Datepicker
  //
  //   return this.http.post<Order[]>('http://localhost:5005/getOrdersByDate', formData)
  //     .pipe(
  //       catchError(err => of(err)),
  //       map((orders: Order[]) => {
  //         // @ts-ignore
  //         const result = orders.slice(criteria?.pageIndex, criteria?.pageIndex + criteria?.pageSize);
  //         return result;
  //       })
  //     );
  // }
}
