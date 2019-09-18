import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsCashComponent } from './reports-cash.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsCashComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsCashRoutingModule { }
