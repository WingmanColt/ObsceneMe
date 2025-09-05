// home-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponentFactoryService } from './home-component-factory.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponentFactoryService.prototype.getHomeComponent()
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
