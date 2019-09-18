import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DebtsToPayComponent } from './debts-to-pay.component';

const routes: Routes = [
  {
    path: '',
    component: DebtsToPayComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DebtsToPayRoutingModule { }
