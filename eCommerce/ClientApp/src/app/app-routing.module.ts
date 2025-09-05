import { NgModule } from "@angular/core";
import { Routes, RouterModule, RouteReuseStrategy } from "@angular/router";
import { ShopComponent } from "./shop/shop.component";
import { PagesComponent } from "./pages/pages.component";
import { CustomRouteReuseStrategy } from "./shop/CustomReuseStrategy";

const routes: Routes = [
    {
        path: "",
        loadChildren: () => import("./home/home.module").then((m) => m.HomeModule),
    },
    {
        path: "shop",
        component: ShopComponent,
        loadChildren: () => import("./shop/shop.module").then((m) => m.ShopModule),
    },
    {
        path: "pages",
        component: PagesComponent,
        loadChildren: () => import("./pages/pages.module").then((m) => m.PagesModule),
    },
    {
        path: "**", // Navigate to Home Page if not found any page
        redirectTo: "/",
    },
];
/*
bootstrapApplication(AppComponent, {
    providers: [
        provideAnimationsAsync(),
        provideRouter(routes, withViewTransitions())]
});
*/
@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: false,
            anchorScrolling: "enabled",
            scrollPositionRestoration: "enabled",
            onSameUrlNavigation: "reload",
            //scrollPositionRestoration: 'top',

            // relativeLinkResolution: 'legacy'
        }),
    ],
    providers: [{ provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }],
    exports: [RouterModule],
})
export class AppRoutingModule { }
