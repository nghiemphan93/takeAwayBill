import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {Order} from "../models/Order";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {
  }

  /**
   * Send Get Request to Server with date as parameter to get orders of the date
   * @param date: formatted as 'YYYY-MM-DD'
   */
  getOrdersByDate(date: string): Observable<Order[]> {
    const formData = new FormData();
    formData.append('date', date)
    return this.http.post<Order[]>('http://localhost:5005/getOrdersByDate', formData)
      .pipe(catchError(err => of(err)));
  }
}
