import { Component, OnDestroy, OnInit } from '@angular/core';
import { SpinnerService } from '../services/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { Order } from '../models/Order';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { LiveOrder } from '../models/LiveOrder';
import { OrderCriteria } from '../models/orderCriteria';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { LiveOrderDetailComponent } from './live-order-detail/live-order-detail.component';

@Component({
  selector: 'app-live-order',
  templateUrl: './live-order.component.html',
  styleUrls: ['./live-order.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class LiveOrderComponent implements OnInit, OnDestroy {
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
    private dialog: MatDialog
  ) {}

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
          console.table(this.loadedOrders);
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

  ngOnDestroy() {}

  handleClick() {
    console.log('clicking...');
  }

  showLiveOrderDetail(element: LiveOrder) {
    console.log(element);
    this.dialog.open(LiveOrderDetailComponent, {
      data: element,
      maxHeight: '90vh',
    });
  }
}
