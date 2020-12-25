import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {Observable} from 'rxjs';
import {OrderCriteria} from '../../models/orderCriteria';
import {AuthService} from '../../services/auth.service';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/Order';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl, FormGroup} from "@angular/forms";
import {DownloadService} from "../../services/download.service";

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
  });

  @ViewChild(MatSort) sort?: MatSort;

  constructor(private authService: AuthService,
              private orderService: OrderService,
              private downloadService: DownloadService) {
  }

  async ngOnInit(): Promise<void> {
    this.isAuth$ = this.authService.getAuth();
    this.datePickerForm.setValue({chosenDate: new Date()});
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

      if (orders.length > 0) {
        // @ts-ignore
        this.ordersDataSource.sort = this.sort;
      }
    });
  }

  formatTime(time: Date): string {
    const month = ((time.getMonth() + 1) < 10 ? '0' : '') + (time.getMonth() + 1);
    const date = (time.getDate() < 10 ? '0' : '') + time.getDate();
    return time.getFullYear() + '-' + month + '-' + date;
  }

  formatTimeWithHour(time: Date): string {
    const month = ((time.getMonth() + 1) < 10 ? '0' : '') + (time.getMonth() + 1);
    const date = (time.getDate() < 10 ? '0' : '') + time.getDate();
    const hour = (time.getHours()) + time.getMinutes();
    return time.getFullYear() + '-' + month + '-' + date + '-' + hour;
  }

  onTestPdf() {
    const columns = ['Datum', '#', '€', ''];
    const dataToPdf: Array<Array<any>> = [];
    dataToPdf.push(columns);
    this.loadedOrders.forEach(order => {
      // order.createdAt = this.formatTimeWithHour(order.createdAt);
      dataToPdf.push([order.createdAt, order.orderCode, order.price, order.paidOnline === 1 ? "*" : '']);
    })
    console.log(dataToPdf);
    this.downloadService.toPdf(dataToPdf);
  }
}
