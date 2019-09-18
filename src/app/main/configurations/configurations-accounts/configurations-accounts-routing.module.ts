import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationsAccountsComponent } from './configurations-accounts.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationsAccountsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationsAccountsRoutingModule { }
