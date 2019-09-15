import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsSalesRoutingModule } from './reports-sales-routing.module';
import { ReportsSalesComponent } from './reports-sales.component';

@NgModule({
  declarations: [ReportsSalesComponent],
  imports: [
    CommonModule,
    ReportsSalesRoutingModule
  ]
})
export class ReportsSalesModule { }
