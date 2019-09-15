import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsSystemStatsComponent } from './reports-system-stats.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsSystemStatsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsSystemStatsRoutingModule { }
