import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsSystemActivityComponent } from './reports-system-activity.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsSystemActivityComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsSystemActivityRoutingModule { }
