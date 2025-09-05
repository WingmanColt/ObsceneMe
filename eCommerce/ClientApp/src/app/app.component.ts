import { Component, OnInit, ViewChild } from "@angular/core";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { map, delay, withLatestFrom } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "environments/environment";
import { BaseService } from "./Services/base.service";
import { SubscriptionTrackerService } from "./Services/Tracker/subscription-tracker.service";
import { DiscountModalComponent } from "./shared/components/modal/discount-modal/discount-modal.component";
import { DiscountModalService } from "./Services/Modal/modal.service";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";

@Component({
 selector: "app-root",
 templateUrl: "./app.component.html",
 styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

 env = environment;
 settings = this.env.setting;
 @ViewChild("discountModal") DiscountModal: DiscountModalComponent | undefined;


 constructor(
    public loader: LoadingBarService, 
    private baseService: BaseService, 
    private translate: TranslateService, 
    private subTracker: SubscriptionTrackerService,
    private modalService: DiscountModalService) {
    translate.addLangs(environment.useLanguages);

   this.translate.setDefaultLang(this.env.defaultLanguage);
   
  if (!environment.production) {
   // in console -> console.log(window.subTracker.activeSubscriptionsCount);
   (window as any).subTracker = this.subTracker;
  }

// For Progressbar
 const loaders = this.loader?.value$.pipe(
  delay(1000),
  withLatestFrom(this.loader?.value$),
  map((v) => v[1]));
 }

 
 async ngOnInit() {
  if(this.settings.openDiscountModal) {
  try {
   await this.baseService.initializeSettings();
   const state = await this.modalService.getModalState();

   if(state == null || state == 0) {
    setTimeout(() => this.modalService.openModal(), 30000)
  }
  } catch (error) {
   console.error("Error initializing settings:", error);
   // Handle the error, maybe show a message to the user.
   }
  }

  this.captureReferralCode();
 }
 
captureReferralCode(): void {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    let ref = url.searchParams.get('ref'); // check for ?ref=...

    // If no query param, try path-based ref
    if (!ref) {
      const match = currentUrl.match(/\/ref=([A-Za-z0-9]+)/);
      if (match) {
        ref = match[1];
      }
    }

    if (ref && !sessionStorage.getItem('affiliate_ref')) {
      sessionStorage.setItem('affiliate_ref', ref);

      // Remove ref from URL without reloading
      const cleanUrl = currentUrl.replace(/[?&]ref=[^&]+/, '');
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
}
