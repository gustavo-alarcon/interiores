import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThirdPartiesProvidersComponent } from './third-parties-providers.component';

const routes: Routes = [
  {
    path: '',
    component: ThirdPartiesProvidersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThirdPartiesProvidersRoutingModule { }
