import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { LiveOrder } from '../../models/LiveOrder';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LiveOrderDetailComponent } from '../live-order-detail/live-order-detail.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { StatusPipe } from '../../shared/pipes/status.pipe';
import { CurrencyPipe, DatePipe, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-live-order',
  templateUrl: './live-order.component.html',
  styleUrls: ['./live-order.component.scss'],
  imports: [
    MatTableModule,
    MatSortModule,
    StatusPipe,
    CurrencyPipe,
    DatePipe,
    NgStyle,
    MatIcon,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveOrderComponent implements OnInit, OnDestroy {
  loadedOrders: LiveOrder[] = [];
  ordersDataSource = new MatTableDataSource<LiveOrder>();
  displayedColumns: string[] = [
    'placedDate',
    'orderCode',
    'street',
    'subtotal',
    'paymentType',
    'status',
  ];
  isAuth$ = new Observable<boolean>();
  subscriptions = new Subscription();

  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private readonly spinnerService: SpinnerService,
    private readonly matSnackBar: MatSnackBar,
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
    private readonly modalService: NzModalService,
  ) {}

  ngOnInit(): void {
    void this.initializeLiveOrders();
  }

  private async initializeLiveOrders(): Promise<void> {
    this.isAuth$ = this.authService.getAuth();
    this.loadLiveOrders();
  }

  loadLiveOrders(): void {
    this.subscriptions.add(
      this.orderService.getLiveOrders().subscribe((liveOrders) => {
        this.loadedOrders = liveOrders;
        console.log(this.loadedOrders);
        this.ordersDataSource.data = this.loadedOrders;
        if (liveOrders.length > 0) {
          // @ts-ignore
          this.ordersDataSource.sort = this.sort;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  showLiveOrderDetail(element: LiveOrder): void {
    this.modalService.create({
      nzContent: LiveOrderDetailComponent,
      nzData: element,
      nzFooter: null,
    });
  }

  isSummerTime(date: Date): boolean {
    const currentMonth = new Date(date).getMonth() + 1;
    return currentMonth >= 4 && currentMonth <= 10;
  }
}
