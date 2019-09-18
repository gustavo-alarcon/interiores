import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationsPermitsRoutingModule } from './configurations-permits-routing.module';
import { ConfigurationsPermitsComponent } from './configurations-permits.component';

@NgModule({
  declarations: [ConfigurationsPermitsComponent],
  imports: [
    CommonModule,
    ConfigurationsPermitsRoutingModule
  ]
})
export class ConfigurationsPermitsModule { }
