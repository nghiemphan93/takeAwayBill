import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiveOrderRoutingModule } from './live-order-routing.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LiveOrderDetailComponent } from './live-order-detail/live-order-detail.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { LiveOrderComponent } from './live-order/live-order.component';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
  declarations: [LiveOrderDetailComponent, LiveOrderComponent],
  imports: [
    CommonModule,
    LiveOrderRoutingModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    NzModalModule,
    NzButtonModule,
  ],
})
export class LiveOrderModule {}
