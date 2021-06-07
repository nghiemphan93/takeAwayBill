import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveOrder } from '../../models/LiveOrder';
import { LiveOrderComponent } from '../live-order/live-order.component';

@Component({
  selector: 'app-live-order-detail',
  templateUrl: './live-order-detail.component.html',
  styleUrls: ['./live-order-detail.component.scss'],
})
export class LiveOrderDetailComponent implements OnInit {
  @Input() data!: LiveOrder;
  constructor() {}

  ngOnInit(): void {}
}
