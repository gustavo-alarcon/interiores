import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsCashRoutingModule } from './reports-cash-routing.module';
import { ReportsCashComponent } from './reports-cash.component';

@NgModule({
  declarations: [ReportsCashComponent],
  imports: [
    CommonModule,
    ReportsCashRoutingModule
  ]
})
export class ReportsCashModule { }
