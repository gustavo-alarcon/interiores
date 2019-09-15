import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsSystemActivityRoutingModule } from './reports-system-activity-routing.module';
import { ReportsSystemActivityComponent } from './reports-system-activity.component';

@NgModule({
  declarations: [ReportsSystemActivityComponent],
  imports: [
    CommonModule,
    ReportsSystemActivityRoutingModule
  ]
})
export class ReportsSystemActivityModule { }
