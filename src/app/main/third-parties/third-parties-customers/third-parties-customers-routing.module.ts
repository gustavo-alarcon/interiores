import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThirdPartiesCustomersComponent } from './third-parties-customers.component';

const routes: Routes = [
  {
    path: '',
    component: ThirdPartiesCustomersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThirdPartiesCustomersRoutingModule { }
