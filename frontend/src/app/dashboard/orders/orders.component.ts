import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Observable} from 'rxjs';
import {OrderCriteria} from '../../models/orderCriteria';
import {AuthService} from '../../services/auth.service';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/Order';
import {MatDatepicker, MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  loadedOrders = [];
  loadingOrders = [];
  orders = new MatTableDataSource<Order[]>();
  start = 0;
  limit = 15;
  end: number = this.limit + this.start;

  displayedColumns: string[] = ['createdAt', 'orderCode', 'postcode', 'price', 'paidOnline'];
  initialPageIndex = 0;
  initialPageSize = 15;

  @ViewChild(MatPaginator, {static: true}) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatDatepicker) matDatepicker?: MatDatepicker<any>;
  @ViewChild('orderCodeInput') orderCodeInput?: ElementRef;
  @ViewChild('postCodeInput') postCodeInput?: ElementRef;
  @ViewChild('priceInput') priceInput?: ElementRef;

  isAuth$ = new Observable<boolean>();

  constructor(private authService: AuthService, private orderService: OrderService) {
  }

  async ngOnInit(): Promise<void> {
    // @ts-ignore
    this.loadedOrders = await this.orderService.getOrders().toPromise();
    this.orders = new MatTableDataSource<Order[]>(this.loadedOrders);

    // @ts-ignore
    this.loadingOrders = this.getTableData(this.start, this.end);
    this.updateIndex();
    try {
      this.isAuth$ = this.authService.getAuth();
    } catch (e) {
      console.log(e);
    }
  }

  /*ngAfterViewInit(): void {
    // TODO: Implement Sorting
     if (this.sort) {
       // @ts-ignore
       this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

       merge(this.sort.sortChange)
         .pipe(
           tap(() => this.loadOrdersTable())
         ).subscribe();
     }
  }

  async loadOrdersTable(date?: string): Promise<void> {
    const criteria: OrderCriteria = {
      createdAt: date,
      orderCode: this.orderCodeInput?.nativeElement.value,
      postcode: this.postCodeInput?.nativeElement.value,
      price: this.priceInput?.nativeElement.value,
      sortDirection: this.sort?.direction,
      sortColumn: this.sort?.active,
    };

    // @ts-ignore
    this.loadedOrders = await this.orderService.getOrders(criteria).toPromise();
    console.log('haha: ' + this.loadedOrders);
  }*/

  onTableScroll(e?: Event): void {
    // @ts-ignore
    const tableViewHeight = e.target.offsetHeight; // viewport
    // @ts-ignore
    const tableScrollHeight = e.target.scrollHeight; // length of all table
    // @ts-ignore
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 200px of the bottom, add more data
    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit) {
      const data = this.getTableData(this.start, this.end);
      // @ts-ignore
      this.loadingOrders = this.loadingOrders.concat(data);
      this.updateIndex();
    }
  }

  getTableData(start: number, end: number): Order[] {
    console.log('start:' + start + ' end: ' + end);
    return this.loadedOrders.filter((value, index) => index >= start && index < end);
  }

  updateIndex(): void {
    this.start = this.end;
    this.end = this.limit + this.start;
  }

  calcPaidOrders(paidOnline: number): number {
    return this.orderService.countPaidOrders(this.loadedOrders, paidOnline);
  }

  calcAmountPaidOrders(paidOnline: number): number {
    return this.orderService.calcAmountPaidOrders(this.loadedOrders, paidOnline);
  }

  onDateChanged($event: MatDatepickerInputEvent<Date>): void {
    // @ts-ignore
    const dateString = this.formatTime($event.value);
    console.log(dateString);

    const criteria: OrderCriteria = {createdAt: dateString};
    this.refresh(criteria);
  }

  refresh(criteria: OrderCriteria): void {
    this.orderService.getOrders(criteria).subscribe((orders) => {
      // @ts-ignore
      this.orders = orders;
      // @ts-ignore
      this.loadedOrders = orders;
    });
  }

  formatTime(time: Date): string {
    const month = ((time.getMonth() + 1) < 10 ? '0' : '') + (time.getMonth() + 1);
    const date = (time.getDate() < 10 ? '0' : '') + time.getDate();

    return time.getFullYear() + '-' + month + '-' + date;
  }
}
