import { Component, inject, OnInit } from '@angular/core';
import { LiveOrder } from '../../models/LiveOrder';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-live-order-detail',
  templateUrl: './live-order-detail.component.html',
  styleUrls: ['./live-order-detail.component.scss'],
})
export class LiveOrderDetailComponent implements OnInit {
  readonly data: LiveOrder = inject(NZ_MODAL_DATA);

  constructor() {}

  ngOnInit(): void {}
}
