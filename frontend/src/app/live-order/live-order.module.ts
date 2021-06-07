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
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [LiveOrderDetailComponent],
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
    MatDialogModule,
  ],
})
export class LiveOrderModule {}
