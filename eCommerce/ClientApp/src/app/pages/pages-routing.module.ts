import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { PrivacyComponent } from "./privacy/privacy.component";
import { AboutUsComponent } from "./about-us/about-us.component";
import { ErrorComponent } from "./error/error.component";
import { FaqComponent } from "./faq/faq.component";
import { ReturnsWarrantyComponent } from "./returns-warranty/returns-warranty.component";
import { ContactComponent } from "./contact/contact.component";
import { RegisterAffiliateAccountComponent } from "./register-affiliate-account/register-affiliate-account.component";
import { UserInfoComponent } from "./account/user-info/user-info.component";
import { GiftShuffleComponent } from "./gift-shuffle/gift-shuffle.component";
import { CategoriesPageComponent } from "./categories/categories.component";
import { authGuard } from "../Guards/AuthGuard";
import { ReviewsPageComponent } from "./reviews-page/reviews-page.component";

const routes: Routes = [
   {
      path: "aboutus",
      component: AboutUsComponent,
   },

   {
      path: "404",
      component: ErrorComponent,
   },

   {
      path: "faq",
      component: FaqComponent,
   },
   {
      path: "returns-warranty",
      component: ReturnsWarrantyComponent,
   },
   {
      path: "privacy",
      component: PrivacyComponent,
   },
   {
      path: "contact",
      component: ContactComponent,
   },
      {
      path: "gift",
      component: GiftShuffleComponent,
   },
   {
      path: "register-affiliate-account",
      component: RegisterAffiliateAccountComponent,
   },
   {
      path: "categories",
      component: CategoriesPageComponent,
   },
   {
      path: "reviews",
      component: ReviewsPageComponent,
   },
   {
   path: 'account/user-info/:activeTab',
   component: UserInfoComponent,
   canActivate: [authGuard]
   },
   {
   path: 'account/user-info',
   component: UserInfoComponent,
   canActivate: [authGuard]
   }



];
/*
bootstrapApplication(PagesComponent, {
   providers: [provideAnimationsAsync(), provideRouter(routes, withViewTransitions())]
});*/
@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class PagesRoutingModule { }
