import {Injectable} from '@angular/core';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Order} from '../models/Order';
import {OrderService} from './order.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {OrderCriteria} from '../models/orderCriteria';
import {catchError, finalize} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class OrderDatasourceService implements DataSource<Order> {

  orderCount?: number;
  private orderSubject = new BehaviorSubject<Order[]>([]);
  private orderLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private orderService: OrderService) {
    this.orderService.orderCount.subscribe((orderCount) => this.orderCount = orderCount);
  }

  connect(collectionViewer: CollectionViewer): Observable<Order[]> {
    return this.orderSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.orderSubject.complete();
  }

  loadOrders(criteria: OrderCriteria): void {
    /*this.orderService.getOrders(criteria)
      .subscribe(
        orderList => {
          this.orderSubject.next(orderList);
          const allCrit: OrderCriteria = Object.assign({}, criteria);
          Object.assign(allCrit, {pageIndex: -1, pageSize: -1});
          this.orderService.getOrders(allCrit).subscribe(
            orders => this.orderCount = orders.length);
        });*/

    this.orderService.getOrders(criteria)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.orderLoadingSubject.next(false))
      )
      .subscribe(orders => {
        this.orderSubject.next(orders);
        this.orderCount = orders.length;
      });
  }
}
