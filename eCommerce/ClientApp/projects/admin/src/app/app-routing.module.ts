import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { content } from './shared/routes/content-routes';
import { ContentLayoutComponent } from './shared/layout/content-layout/content-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductListComponent } from './components/products/physical/product-list/product-list.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: "home", 
    pathMatch: 'full' 
  },
  {
    path: 'dashboard/default',
    component: DashboardComponent, // Separate route for the dashboard
    // canActivate: [AuthGuard] // Uncomment if authentication is required
  },
  {
    path: 'auth/login',
    component: LoginComponent // Route for the login page
  },
   {
    path: '',
    component: ContentLayoutComponent,
    children: content,
    // canActivate: [AuthGuard] // Uncomment if authentication is required
  }, 
  {
    path: '**', // Wildcard route to handle undefined paths
    redirectTo: '', // Redirect to homepage (ProductListComponent) on invalid URLs
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    // relativeLinkResolution: 'legacy' // Uncomment if using legacy routing
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
