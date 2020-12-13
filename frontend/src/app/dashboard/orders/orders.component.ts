import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {OrderDatasourceService} from '../../services/order.datasource.service';
import {MatSort} from '@angular/material/sort';
import {OrderService} from '../../services/order.service';
import {tap} from 'rxjs/operators';
import {merge} from 'rxjs';
import {OrderCriteria} from '../../models/orderCriteria';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, AfterViewInit {

  // @ts-ignore
  orderDataSource: OrderDatasourceService;

  displayedColumns: string[] = ['createdAt', 'orderCode', 'city', 'price', 'paidOnline'];
  initialPageIndex = 0;
  initialPageSize = 10;

  @ViewChild(MatPaginator, {static: true}) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild('orderCodeInput') orderCodeInput?: ElementRef;
  @ViewChild('cityInput') cityInput?: ElementRef;
  @ViewChild('priceInput') priceInput?: ElementRef;

  constructor(private orderService: OrderService) {
  }

  ngOnInit(): void {
    this.orderDataSource = new OrderDatasourceService(this.orderService);
    this.orderDataSource.loadOrders(
      {
        sortDirection: 'asc',
        sortColumn: 'createdAt',
        pageIndex: this.initialPageIndex,
        pageSize: this.initialPageSize
      }
    );
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
      city: this.cityInput?.nativeElement.value,
      price: this.priceInput?.nativeElement.value,
      sortDirection: this.sort?.direction,
      sortColumn: this.sort?.active,
      pageIndex: this.paginator?.pageIndex,
      pageSize: this.paginator?.pageSize

    };
    this.orderDataSource?.loadOrders(criteria);
  }

}
