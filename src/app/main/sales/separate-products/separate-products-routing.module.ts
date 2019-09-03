import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SeparateProductsComponent } from './separate-products.component';

const routes: Routes = [
  {
    path: '',
    component: SeparateProductsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeparateProductsRoutingModule { }
