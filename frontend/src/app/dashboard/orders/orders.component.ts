import {Component, OnInit} from '@angular/core';
import {Order} from '../../models/Order';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orderDataSource: Order[] = [
    {createdAt: new Date(), orderCode: 'T0KTN6', city: 'Berlin', price: 20.50, paidOnline: true},
    {createdAt: new Date(), orderCode: 'IEYBDD', city: 'Hanover', price: 74.60, paidOnline: false},
    {createdAt: new Date(), orderCode: 'FT48CP', city: 'Dresden', price: 14.25, paidOnline: true},
  ];

  displayedColumns: string[] = ['createdAt', 'orderCode', 'city', 'price', 'paidOnline'];

  constructor() {
  }

  ngOnInit(): void {
  }

}
