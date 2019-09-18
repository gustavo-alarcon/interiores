import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsProductionRoutingModule } from './reports-production-routing.module';
import { ReportsProductionComponent } from './reports-production.component';

@NgModule({
  declarations: [ReportsProductionComponent],
  imports: [
    CommonModule,
    ReportsProductionRoutingModule
  ]
})
export class ReportsProductionModule { }
