import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationsAccountsRoutingModule } from './configurations-accounts-routing.module';
import { ConfigurationsAccountsComponent } from './configurations-accounts.component';

@NgModule({
  declarations: [ConfigurationsAccountsComponent],
  imports: [
    CommonModule,
    ConfigurationsAccountsRoutingModule
  ]
})
export class ConfigurationsAccountsModule { }
