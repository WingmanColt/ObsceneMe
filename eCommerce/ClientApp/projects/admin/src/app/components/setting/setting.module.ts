import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SettingRoutingModule } from './setting-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../../shared/shared.module';
import { PrimitiveComponent } from './enviroment-settings/extensions/primitive/primitive.component';
import { ObjectComponent } from './enviroment-settings/extensions/object/object.component';
import { ArrayComponent } from './enviroment-settings/extensions/array/array.component';
import { EnviromentSettingsComponent } from './enviroment-settings/enviroment-settings.component';

@NgModule({
  declarations: [ProfileComponent, EnviromentSettingsComponent, PrimitiveComponent, ObjectComponent,ArrayComponent],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule, 
    ReactiveFormsModule,
    SettingRoutingModule,
    SharedModule
  ]
})
export class SettingModule { }
