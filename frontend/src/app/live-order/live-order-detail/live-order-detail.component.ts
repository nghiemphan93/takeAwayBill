import { Component, inject, OnInit } from '@angular/core';
import { LiveOrder } from '../../models/LiveOrder';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { StatusPipe } from '../../shared/pipes/status.pipe';
import { CurrencyPipe, NgForOf } from '@angular/common';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-live-order-detail',
  templateUrl: './live-order-detail.component.html',
  styleUrls: ['./live-order-detail.component.scss'],
  imports: [StatusPipe, CurrencyPipe, NgForOf, NzTypographyComponent],
  standalone: true,
})
export class LiveOrderDetailComponent implements OnInit {
  readonly data: LiveOrder = inject(NZ_MODAL_DATA);

  constructor() {}

  ngOnInit(): void {}
}
