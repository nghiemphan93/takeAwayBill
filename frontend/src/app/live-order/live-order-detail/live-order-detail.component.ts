import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveOrder } from '../../models/LiveOrder';

@Component({
  selector: 'app-live-order-detail',
  templateUrl: './live-order-detail.component.html',
  styleUrls: ['./live-order-detail.component.scss'],
})
export class LiveOrderDetailComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: LiveOrder) {}

  ngOnInit(): void {}
}
