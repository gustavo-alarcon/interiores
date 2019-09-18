import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsSalesComponent } from './reports-sales.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsSalesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsSalesRoutingModule { }
