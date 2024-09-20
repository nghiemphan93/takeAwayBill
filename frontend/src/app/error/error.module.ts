import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorRoutingModule } from './error-routing.module';
import { NotfoundComponent } from './notfound/notfound.component';


@NgModule({
  declarations: [NotfoundComponent],
  imports: [
    CommonModule,
    ErrorRoutingModule
  ]
})
export class ErrorModule { }
