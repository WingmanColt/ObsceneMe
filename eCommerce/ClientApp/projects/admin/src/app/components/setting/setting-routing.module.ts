import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { EnviromentSettingsComponent } from './enviroment-settings/enviroment-settings.component';


const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    data: {
      title: "Profile",
      breadcrumb: "Profile"
    }
  },
  {
    path: 'env',
    component: EnviromentSettingsComponent,
    data: {
      title: "Enviroment Settings",
      breadcrumb: "Enviroment Settings"
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
