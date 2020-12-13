import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { OrdersComponent } from './orders/orders.component';
import {MatButtonModule} from "@angular/material/button";


@NgModule({
  declarations: [OrdersComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatButtonModule
  ]
})
export class DashboardModule { }
