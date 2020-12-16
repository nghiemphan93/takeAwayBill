import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Observable} from 'rxjs';
import {OrderCriteria} from '../../models/orderCriteria';
import {AuthService} from '../../services/auth.service';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/Order';
import {MatDatepicker} from '@angular/material/datepicker';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  loadedOrders: Order[] = [];
  ordersDataSource = new MatTableDataSource<Order>();
  displayedColumns: string[] = ['createdAt', 'orderCode', 'postcode', 'price', 'paidOnline'];
  isAuth$ = new Observable<boolean>();

  datePickerForm = new FormGroup({
    chosenDate: new FormControl()
  })

  @ViewChild(MatPaginator, {static: true}) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatDatepicker) matDatepicker?: MatDatepicker<Date>;

  constructor(private authService: AuthService,
              private orderService: OrderService) {
  }

  async ngOnInit(): Promise<void> {
    this.isAuth$ = this.authService.getAuth();
    this.datePickerForm.setValue({'chosenDate': new Date()});
    this.onDateChanged(this.datePickerForm.value.chosenDate);
  }

  countOrders(isPaidOnline: number): number {
    return this.orderService.countPaidOrders(this.loadedOrders, isPaidOnline);
  }

  calcRevenues(isPaidOnline: number): number {
    return this.orderService.calcRevenues(this.loadedOrders, isPaidOnline);
  }

  onDateChanged(chosenDate: Date): void {
    const dateString = this.formatTime(chosenDate);
    const criteria: OrderCriteria = {createdAt: dateString};
    this.loadNewOrders(criteria);
  }

  loadNewOrders(criteria: OrderCriteria): void {
    this.orderService.getOrders(criteria).subscribe((orders) => {
      this.loadedOrders = orders;
      this.ordersDataSource.data = this.loadedOrders;
      // @ts-ignore
      this.ordersDataSource.sort = this.sort;
    });
  }

  formatTime(time: Date): string {
    const month = ((time.getMonth() + 1) < 10 ? '0' : '') + (time.getMonth() + 1);
    const date = (time.getDate() < 10 ? '0' : '') + time.getDate();
    return time.getFullYear() + '-' + month + '-' + date;
  }
}
