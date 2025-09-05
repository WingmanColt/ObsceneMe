import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AffiliateUsersComponent } from './affiliate-users/affiliate-users.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'affiliate-users',
        component: AffiliateUsersComponent,
        data: {
          title: "Affiliate Users",
          breadcrumb: "Affiliate Users"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AffiliateRoutingModule { }
