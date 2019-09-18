import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThirdPartiesWholesaleComponent } from './third-parties-wholesale.component';

const routes: Routes = [
  {
    path: '',
    component: ThirdPartiesWholesaleComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThirdPartiesWholesaleRoutingModule { }
