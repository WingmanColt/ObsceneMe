import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  
  // Determines whether the route should be detached (stored for later reuse)
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false; // We do not want to store the route
  }

  // Stores the route
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // No-op since we're not storing anything
  }

  // Determines whether the route should be reattached from previously stored data
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false; // We do not want to reattach the stored route
  }

  // Fetches the stored route (this is where the missing method 'retrieve' comes in)
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null; // Return null because we are not storing routes
  }

  // Determines whether the route should be reused
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig; // Only reuse the route if the configuration matches
  }
}
