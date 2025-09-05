import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LoadingBarRouterModule } from "@ngx-loading-bar/router";
import { SharedModule } from "./shared/shared.module";
import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
import { ShopComponent } from "./shop/shop.component";
import { PagesComponent } from "./pages/pages.component";
import { WebApiUrls } from "./configs/webApiUrls";
import { FormsModule } from "@angular/forms";
import { httpInterceptorProviders } from "./Interceptors";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from "@angular/platform-browser";
import { HttpBackend, HttpClientModule } from "@angular/common/http";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "./Interceptors/TranslateHttpLoader";


export function HttpLoaderFactory(httpBackend: HttpBackend) {
  // Array of translation file prefixes, adjust the array according to your project
  const translationPrefixes = [
    './assets/i18n/',
    './assets/i18n/parfume/',
    //'./assets/i18n/general/', 
  //  './assets/i18n/categories/',
    //'./assets/i18n/products/'
  ];

  return new TranslateHttpLoader(httpBackend, translationPrefixes);
}

@NgModule({
  declarations: [AppComponent, ShopComponent, PagesComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    SharedModule,
    FormsModule,
    BrowserAnimationsModule,
    NgbModule,
    LoadingBarRouterModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpBackend]
      }
    }),
  ],
  providers: [WebApiUrls, httpInterceptorProviders],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
