import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Observable} from "rxjs";
import {OrderService} from "../../services/order.service";
import {Order} from "../../models/Order";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders$ = new Observable<Order[]>();
  isAuth$ = new Observable<boolean>();

  constructor(private authService: AuthService,
              private orderService: OrderService) {
  }

  async ngOnInit() {
    try {
      this.isAuth$ = this.authService.getAuth();
      this.orders$ = this.orderService.getOrdersByDate('2020-09-10');

      this.orders$.subscribe(data => console.log(JSON.stringify(data)));
    } catch (e) {
      console.log(e);
    }

  }
}
