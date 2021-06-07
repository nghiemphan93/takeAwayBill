import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Observable, Subscription } from 'rxjs';
import { OrderCriteria } from '../../models/orderCriteria';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/Order';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { DownloadService } from '../../services/download.service';
import { SpinnerService } from '../../services/spinner.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  loadedOrders: Order[] = [];
  ordersDataSource = new MatTableDataSource<Order>();
  displayedColumns: string[] = [
    'createdAt',
    'orderCode',
    'postcode',
    'price',
    'paidOnline',
  ];
  isAuth$ = new Observable<boolean>();
  subscriptions = new Subscription();

  datePickerForm = new FormGroup({
    chosenDate: new FormControl(),
  });

  numbOnlineOrders = 0;
  numbOfflineOrders = 0;
  onlineRevenues = 0;
  offlineRevenues = 0;

  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private downloadService: DownloadService,
    private spinnerService: SpinnerService,
    private matSnackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuth$ = this.authService.getAuth();
    this.datePickerForm.setValue({ chosenDate: new Date() });
    this.onDateChanged(this.datePickerForm.value.chosenDate);
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  countOrders(isPaidOnline: number): number {
    return this.orderService.countPaidOrders(this.loadedOrders, isPaidOnline);
  }

  calcRevenues(isPaidOnline: number): number {
    return this.orderService.calcRevenues(this.loadedOrders, isPaidOnline);
  }

  calcSums(): void {
    this.numbOnlineOrders = this.countOrders(1);
    this.numbOfflineOrders = this.countOrders(0);
    this.onlineRevenues = this.calcRevenues(1);
    this.offlineRevenues = this.calcRevenues(0);
  }

  onDateChanged(chosenDate: Date): void {
    const dateString = this.formatTime(chosenDate);
    const criteria: OrderCriteria = { createdAt: dateString };
    this.loadNewOrders(criteria);
  }

  loadNewOrders(criteria: OrderCriteria): void {
    this.spinnerService.show();
    this.orderService.getOrders(criteria).subscribe(
      (orders) => {
        this.loadedOrders = orders;
        this.ordersDataSource.data = this.loadedOrders;
        this.calcSums();
        if (orders.length > 0) {
          // @ts-ignore
          this.ordersDataSource.sort = this.sort;
        }
      },
      (error) => {
        console.error(error);
        this.matSnackBar.open(error.message, '', {
          duration: 3000,
        });
      },
      () => {
        this.spinnerService.hide();
      }
    );
  }

  formatTime(time: Date): string {
    const month = (time.getMonth() + 1 < 10 ? '0' : '') + (time.getMonth() + 1);
    const date = (time.getDate() < 10 ? '0' : '') + time.getDate();
    return time.getFullYear() + '-' + month + '-' + date;
  }

  formatTimeWithHour(time: Date): string {
    const month = (time.getMonth() + 1 < 10 ? '0' : '') + (time.getMonth() + 1);
    const date = (time.getDate() < 10 ? '0' : '') + time.getDate();
    const hour = (time.getHours() < 10 ? '0' : '') + time.getHours();
    const minute = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    return `${date}-${month}-${time.getFullYear()}, ${hour}:${minute}`;
  }

  formatTimeGerman(time: Date): string {
    const month = (time.getMonth() + 1 < 10 ? '0' : '') + (time.getMonth() + 1);
    const date = (time.getDate() < 10 ? '0' : '') + time.getDate();
    return date + '-' + month + '-' + time.getFullYear();
  }

  onExportPdf(): void {
    const columns = ['Datum', '#', '€', ''];
    const dataToPdf: Array<Array<any>> = [];
    dataToPdf.push(columns);
    this.loadedOrders.forEach((order) => {
      if (order.paidOnline === 1) {
        let createdAt: string | Date = new Date(order.createdAt);
        createdAt.setHours(createdAt.getHours() - 1);
        createdAt = this.formatTimeWithHour(createdAt);
        dataToPdf.push([
          createdAt,
          order.orderCode,
          order.price,
          order.paidOnline === 1 ? '*' : '',
        ]);
      }
    });

    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    });

    const headers = [];
    headers.push(`Einzelauflistung`);
    headers.push(`Restaurant: Goldene Drachen `);
    headers.push(
      `Datum: ${this.formatTimeGerman(this.datePickerForm.value.chosenDate)}`
    );

    const sums: Array<string> = [];
    sums.push(
      `Gesamt: \t\t\t\t ${
        this.numbOnlineOrders + this.numbOfflineOrders
      } Bestellungen im Wert von ${formatter.format(
        this.onlineRevenues + this.offlineRevenues
      )}`
    );
    sums.push(
      `Online bezahlt*: \t${
        this.numbOnlineOrders
      } Bestellungen im Wert von ${formatter.format(this.onlineRevenues)}`
    );
    sums.push(
      `Bargeld bezahlt: \t${
        this.numbOfflineOrders
      } Bestellungen im Wert von ${formatter.format(this.offlineRevenues)}`
    );

    try {
      this.spinnerService.show();
      this.downloadService.toPdf(dataToPdf, sums, headers);
    } catch (e) {
      console.error(e);
      this.matSnackBar.open(e.message, '', {
        duration: 3000,
      });
    } finally {
      this.spinnerService.hide();
    }
  }

  onDatePickerFocus(datePicker: MatDatepicker<Date>): void {
    datePicker.open();
  }
}
