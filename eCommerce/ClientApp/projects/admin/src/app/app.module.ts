import { NgModule } from '@angular/core';
import { AgGridModule } from '@ag-grid-community/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { DashboardModule } from './components/dashboard/dashboard.module';
import { SharedModule } from './shared/shared.module';
import { ProductsModule } from './components/products/products.module';
import { SalesModule } from './components/sales/sales.module';
import { CouponsModule } from './components/coupons/coupons.module';
import { PagesModule } from './components/pages/pages.module';
import { MediaModule } from './components/media/media.module';
import { MenusModule } from './components/menus/menus.module';
import { VendorsModule } from './components/vendors/vendors.module';
import { UsersModule } from './components/users/users.module';
import { LocalizationModule } from './components/localization/localization.module';
import { InvoiceModule } from './components/invoice/invoice.module';
import { SettingModule } from './components/setting/setting.module';;
import { ReportsModule } from './components/reports/reports.module';
import { AuthModule } from './components/auth/auth.module';
import { adminApiUrls } from './configs/adminApiUrls';
import { FormsModule } from '@angular/forms';
import { HttpBackend, HttpClientModule } from "@angular/common/http";
import { DatabaseModule } from './components/database/database.module';
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from 'src/app/Interceptors/TranslateHttpLoader';
import { AffiliateModule } from './components/affiliate-program/affiliate.module';

export function HttpLoaderFactory(httpBackend: HttpBackend) {
  // Array of translation file prefixes, adjust the array according to your project
  const translationPrefixes = [
   // './assets/i18n/'
    './assets/i18n/general/', 
  //  './assets/i18n/categories/',
    //'./assets/i18n/products/'
  ];

  return new TranslateHttpLoader(httpBackend, translationPrefixes);
}


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    DashboardModule,
    DatabaseModule,
    InvoiceModule,
    SettingModule,
    ReportsModule,
    AuthModule,
    HttpClientModule,
    SharedModule,
    LocalizationModule,
    ProductsModule,
    SalesModule,
    AffiliateModule,
    VendorsModule,
    CouponsModule,
    PagesModule,
    MediaModule,
    MenusModule,
    UsersModule,
    AgGridModule,
    BrowserAnimationsModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpBackend]
      }
    }),
  ],
  providers: [adminApiUrls],
  bootstrap: [AppComponent]
})
export class AppModule { }

