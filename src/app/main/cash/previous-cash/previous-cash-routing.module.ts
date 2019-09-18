import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreviousCashComponent } from './previous-cash.component';

const routes: Routes = [
  {
    path: '',
    component: PreviousCashComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreviousCashRoutingModule { }
