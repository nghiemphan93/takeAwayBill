import {Component, OnDestroy, OnInit} from '@angular/core';
import {SpinnerService} from '../../services/spinner.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';
import {OrderService} from '../../services/order.service';
import {MatTableDataSource} from '@angular/material/table';
import {Observable, Subscription} from 'rxjs';
import {LiveOrder} from '../../models/LiveOrder';
import {NzModalService} from 'ng-zorro-antd/modal';
import {LiveOrderDetailComponent} from '../live-order-detail/live-order-detail.component';

@Component({
  selector: 'app-live-order',
  templateUrl: './live-order.component.html',
  styleUrls: ['./live-order.component.scss'],
})
export class LiveOrderComponent implements OnInit, OnDestroy {
  isVisibleMiddle = false;
  loadedOrders: LiveOrder[] = [];
  ordersDataSource = new MatTableDataSource<LiveOrder>();
  columnsToDisplay: string[] = [
    'placedDate',
    'orderCode',
    'street',
    'subtotal',
    'paymentType',
  ];
  isAuth$ = new Observable<boolean>();
  subscriptions = new Subscription();
  expandedElement!: LiveOrder | null;

  constructor(
    private spinnerService: SpinnerService,
    private matSnackBar: MatSnackBar,
    private authService: AuthService,
    private orderService: OrderService,
    private modalService: NzModalService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.isAuth$ = this.authService.getAuth();
    this.loadLiveOrders();
  }

  loadLiveOrders(): void {
    this.spinnerService.show();
    this.subscriptions.add(
      this.orderService.getLiveOrders().subscribe(
        (liveOrders) => {
          this.loadedOrders = liveOrders;
          this.ordersDataSource.data = this.loadedOrders;
          // console.table(this.loadedOrders);
          if (liveOrders.length > 0) {
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
      )
    );
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  showLiveOrderDetail(element: LiveOrder) {
    this.modalService.create({
      nzContent: LiveOrderDetailComponent,
      nzComponentParams: {
        data: element,
      },
      nzFooter: null,
    });
  }

  handleCancelMiddle(): void {
    this.isVisibleMiddle = false;
  }

  handleOkMiddle(): void {
    console.log('click ok');
    this.isVisibleMiddle = false;
  }

  isSummerTime(date: Date): boolean {
    const currentMonth = (new Date(date)).getMonth() + 1;
    if (currentMonth >= 4 && currentMonth <= 10) {
      return true;
    }
    return false;
  }
}
