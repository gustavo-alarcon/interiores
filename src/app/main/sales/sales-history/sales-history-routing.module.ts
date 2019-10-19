import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesHistoryComponent } from './sales-history.component';

const routes: Routes = [
  {
    path: '',
    component: SalesHistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesHistoryRoutingModule { }
