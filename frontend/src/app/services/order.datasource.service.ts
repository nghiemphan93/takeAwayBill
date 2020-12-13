import {Injectable} from '@angular/core';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Order} from '../models/Order';
import {OrderService} from './order.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {OrderCriteria} from '../models/orderCriteria';

@Injectable({
  providedIn: 'root'
})
export class OrderDatasourceService implements DataSource<Order> {

  orderCount?: number;
  private orderSubject = new BehaviorSubject<Order[]>([]);

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
    this.orderService.getOrders(criteria)
      .subscribe(
        orderList => {
          this.orderSubject.next(orderList);
          const allCrit: OrderCriteria = Object.assign({}, criteria);
          Object.assign(allCrit, {pageIndex: -1, pageSize: -1});
          this.orderService.getOrders(allCrit).subscribe(
            orders => this.orderCount = orders.length);
        });
  }
}
