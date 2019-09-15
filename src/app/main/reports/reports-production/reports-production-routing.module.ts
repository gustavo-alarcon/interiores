import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsProductionComponent } from './reports-production.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsProductionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsProductionRoutingModule { }
