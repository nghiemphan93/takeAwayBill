import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Order} from '../models/Order';
import {OrderCriteria} from '../models/orderCriteria';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  orderCount = new BehaviorSubject<number>(0);
  data = [
    {createdAt: new Date(), orderCode: 'T0KTN6', city: 'Berlin', price: 20.50, paidOnline: true},
    {createdAt: new Date(), orderCode: 'WXLDH5', city: 'Hanover', price: 74.60, paidOnline: false},
    {createdAt: new Date(), orderCode: 'FT48CP', city: 'Dresden', price: 14.25, paidOnline: true},
    {createdAt: new Date(), orderCode: 'QGIPX3', city: 'Berlin', price: 23.70, paidOnline: false},
    {createdAt: new Date(), orderCode: 'IEYBDD', city: 'Hanover', price: 102.30, paidOnline: false},
    {createdAt: new Date(), orderCode: 'DWO2HT', city: 'Dresden', price: 14.25, paidOnline: true},
    {createdAt: new Date(), orderCode: 'OA57QK', city: 'Dortmund', price: 43.30, paidOnline: true},
    {createdAt: new Date(), orderCode: '13CW71', city: 'Leipzig', price: 58.60, paidOnline: true},
    {createdAt: new Date(), orderCode: 'L2GA5F', city: 'Dresden', price: 15.10, paidOnline: true},
    {createdAt: new Date(), orderCode: '39KWWJ', city: 'Halle', price: 120.50, paidOnline: false},
    {createdAt: new Date(), orderCode: 'LFZDL5', city: 'Muenster', price: 24.00, paidOnline: false},
    {createdAt: new Date(), orderCode: '3QA1S1', city: 'Berlin', price: 4.50, paidOnline: true},
  ];

  constructor(private http: HttpClient) {
    this.orderCount.next(0);
  }

  /**
   * Send Get Request to Server with date as parameter to get orders of the date
   * @param date: formatted as 'YYYY-MM-DD'
   */
  getOrdersByDate(date: string): Observable<Order[]> {
    // TODO
    return of();
  }

  getOrders(criteria?: OrderCriteria): Observable<Order[]> {
    console.log('page Index: ' + criteria?.pageIndex + '   page Size: ' + criteria?.pageSize);

    // TODO: data should be filtered using parameters at Backend instead of here
    // @ts-ignore
    const splicedData = this.data.slice(criteria?.pageIndex, criteria.pageIndex + criteria.pageSize);

    return of(splicedData);
  }
}
