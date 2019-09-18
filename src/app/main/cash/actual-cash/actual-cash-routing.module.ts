import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActualCashComponent } from './actual-cash.component';

const routes: Routes = [
  {
    path: '',
    component: ActualCashComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActualCashRoutingModule { }
