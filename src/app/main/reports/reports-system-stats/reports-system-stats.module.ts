import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsSystemStatsRoutingModule } from './reports-system-stats-routing.module';
import { ReportsSystemStatsComponent } from './reports-system-stats.component';

@NgModule({
  declarations: [ReportsSystemStatsComponent],
  imports: [
    CommonModule,
    ReportsSystemStatsRoutingModule
  ]
})
export class ReportsSystemStatsModule { }
