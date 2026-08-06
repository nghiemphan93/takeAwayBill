import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorRoutingModule } from './error-routing.module';
import { NotfoundComponent } from './notfound/notfound.component';


@NgModule({
  imports: [
    CommonModule,
    ErrorRoutingModule,
    NotfoundComponent,
  ]
})
export class ErrorModule { }
