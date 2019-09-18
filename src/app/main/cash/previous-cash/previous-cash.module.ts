import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreviousCashRoutingModule } from './previous-cash-routing.module';
import { PreviousCashComponent } from './previous-cash.component';

@NgModule({
  declarations: [
    PreviousCashComponent
  ],
  imports: [
    CommonModule,
    PreviousCashRoutingModule
  ]
})
export class PreviousCashModule { }
