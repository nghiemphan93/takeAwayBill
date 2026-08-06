import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { OrderCriteria } from '../../models/orderCriteria';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/Order';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DownloadService } from '../../services/download.service';
import { SpinnerService } from '../../services/spinner.service';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe, DatePipe, NgStyle } from '@angular/common';
import { MatFormField, MatInput } from '@angular/material/input';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: true,
  imports: [
    MatIcon,
    NgStyle,
    MatFormField,
    MatDatepicker,
    MatDatepickerToggle,
    ReactiveFormsModule,
    MatDatepickerInput,
    CurrencyPipe,
    MatTableModule,
    MatSortModule,
    DatePipe,
    MatInput,
  ],
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
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);

  constructor(
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
    private readonly downloadService: DownloadService,
    private readonly spinnerService: SpinnerService,
    private readonly matSnackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    void this.initializeOrders();
  }

  private async initializeOrders(): Promise<void> {
    this.isAuth$ = this.authService.getAuth();
    const chosenDate: string = this.activatedRoute.snapshot.params?.chosenDate;
    const parsedDate = chosenDate
      ? moment(chosenDate, 'YYYY-MM-DD', true).toDate()
      : new Date();
    this.datePickerForm.setValue({ chosenDate: parsedDate });
    await this.stickDateToUrl(parsedDate);
    await this.onDateChanged(this.datePickerForm.value.chosenDate);
  }

  ngOnDestroy(): void {
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

  async stickDateToUrl(chosenDate: Date): Promise<void> {
    const dateString = moment(chosenDate).format('YYYY-MM-DD');
    await this.router.navigate(['dashboard', dateString]);
  }

  async onDateChanged(chosenDate: Date): Promise<void> {
    await this.stickDateToUrl(chosenDate);
    const dateString = this.formatTime(chosenDate);
    const criteria: OrderCriteria = { createdAt: dateString };
    await this.loadNewOrders(criteria);
  }

  async loadNewOrders(criteria: OrderCriteria): Promise<void> {
    this.loadedOrders = await firstValueFrom(
      this.orderService.getOrders(criteria),
    );
    this.ordersDataSource.data = this.loadedOrders;
    this.calcSums();
    if (this.loadedOrders.length > 0) {
      // @ts-ignore
      this.ordersDataSource.sort = this.sort;
    }
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

    const headers = [
      `Einzelauflistung`,
      `Restaurant: Goldene Drachen `,
      `Datum: ${this.formatTimeGerman(this.datePickerForm.value.chosenDate)}`,
    ];

    const sums: Array<string> = [
      `Gesamt: \t\t\t\t ${
        this.numbOnlineOrders + this.numbOfflineOrders
      } Bestellungen im Wert von ${formatter.format(
        this.onlineRevenues + this.offlineRevenues,
      )}`,
      `Online bezahlt*: \t${
        this.numbOnlineOrders
      } Bestellungen im Wert von ${formatter.format(this.onlineRevenues)}`,
      `Bargeld bezahlt: \t${
        this.numbOfflineOrders
      } Bestellungen im Wert von ${formatter.format(this.offlineRevenues)}`,
    ];

    try {
      this.spinnerService.show();
      this.downloadService.toPdf(dataToPdf, sums, headers);
    } catch (e) {
      console.error(e);
      this.matSnackBar.open((e as Error)?.message, '', {
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
