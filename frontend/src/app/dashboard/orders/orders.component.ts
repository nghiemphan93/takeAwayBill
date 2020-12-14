import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {OrderDatasourceService} from '../../services/order.datasource.service';
import {MatSort} from '@angular/material/sort';
import {tap} from 'rxjs/operators';
import {merge, Observable} from 'rxjs';
import {OrderCriteria} from '../../models/orderCriteria';
import {AuthService} from '../../services/auth.service';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/Order';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, AfterViewInit {
  // @ts-ignore
  orderDataSource: OrderDatasourceService;

  displayedColumns: string[] = ['createdAt', 'orderCode', 'postcode', 'price', 'paidOnline'];
  initialPageIndex = 0;
  initialPageSize = 10;

  @ViewChild(MatPaginator, {static: true}) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild('orderCodeInput') orderCodeInput?: ElementRef;
  @ViewChild('postCodeInput') postCodeInput?: ElementRef;
  @ViewChild('priceInput') priceInput?: ElementRef;

  orders$ = new Observable<Order[]>();
  isAuth$ = new Observable<boolean>();

  constructor(private authService: AuthService,
              private orderService: OrderService) {
  }

  async ngOnInit() {
    this.orderDataSource = new OrderDatasourceService(this.orderService);
    this.orderDataSource.loadOrders(
      {
        sortDirection: 'asc',
        sortColumn: 'createdAt',
        pageIndex: this.initialPageIndex,
        pageSize: this.initialPageSize
      }
    );

    try {
      this.isAuth$ = this.authService.getAuth();
      this.orders$ = this.orderService.getOrdersByDate('2020-09-10');
    } catch (e) {
      console.log(e);
    }
  }

  ngAfterViewInit(): void {
    /* const headers = [this.createdAtInput, this.orderCodeInput, this.cityInput, this.priceInput, this.paidOnlineInput];
     for (const header of headers) {
       fromEvent(header?.nativeElement, 'keyup').pipe(
         debounceTime(150),
         distinctUntilChanged(),
         tap(() => {
           this.paginator.pageIndex = 0;
           this.loadOrdersTable();
         })).subscribe();
     }*/

    // Implement Paginator
    if (this.paginator) {
      this.paginator.page
        .pipe(
          tap(() => this.loadOrdersTable())
        ).subscribe();
    }

    // Implement Sorting
    if (this.sort) {
      // @ts-ignore
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

      merge(this.sort.sortChange)
        .pipe(
          tap(() => this.loadOrdersTable())
        ).subscribe();
    }
  }

  loadOrdersTable(): void {
    const criteria: OrderCriteria = {
      orderCode: this.orderCodeInput?.nativeElement.value,
      postcode: this.postCodeInput?.nativeElement.value,
      price: this.priceInput?.nativeElement.value,
      sortDirection: this.sort?.direction,
      sortColumn: this.sort?.active,
      pageIndex: this.paginator?.pageIndex,
      pageSize: this.paginator?.pageSize
    };
    this.orderDataSource.loadOrders(criteria);
  }
}
