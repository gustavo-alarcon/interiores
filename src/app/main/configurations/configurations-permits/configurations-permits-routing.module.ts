import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationsPermitsComponent } from './configurations-permits.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationsPermitsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationsPermitsRoutingModule { }
