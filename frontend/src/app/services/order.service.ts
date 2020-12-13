import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {Order} from "../models/Order";

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
    // TODO
    return of();
  }
}
