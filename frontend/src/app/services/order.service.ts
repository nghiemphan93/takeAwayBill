import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {OrderCriteria} from '../models/orderCriteria';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Order} from '../models/Order';
import {AuthService} from './auth.service';
import {catchError, delay, map, retryWhen, take} from 'rxjs/operators';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient,
              private authService: AuthService,
              private matSnackBar: MatSnackBar) {
  }

  getOrders(criteria?: OrderCriteria): Observable<Order[]> {
    const token = sessionStorage.getItem('token');
    // @ts-ignore
    const httpOptions = {headers: new HttpHeaders({token})};

    const formData = new FormData();
    formData.append('date', criteria?.createdAt || '2020-09-10');
    formData.append('sortDirection', criteria?.sortDirection || 'asc');
    formData.append('sortColumn', criteria?.sortColumn || 'createdAt');

    return this.http.post<Order[]>(`${this.authService.getBaseUrl()}/getOrdersByDate`, formData, httpOptions)
      .pipe(
        retryWhen(errors => {
          let retries = 0;
          return errors.pipe(delay(1000), take(5), map(error => {
            if (retries++ === 4) {
              throw error;
            }
          }));
        }),
        catchError(err => {
          console.log('order failed 401: ' + JSON.stringify(err));
          this.authService.setNotAuthenticated();
          this.matSnackBar.open('Netzwerkfehler, bitte nochmal anmelden!', '', {
            duration: 3000
          });
          return of([]);
        })
      );
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
