import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BaseService } from "src/app/Services/base.service";
import { Currency, Language, SettingEntities } from "../../classes/settings";
import { Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { SubscriptionTrackerService } from "src/app/Services/Tracker/subscription-tracker.service";

@Component({
 selector: "app-settings",
 templateUrl: "./settings.component.html",
 styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit, OnDestroy {
 componentName: string = "SettingsComponent";
 settings$: Observable<any>;
 selectedLang: Language;
 selectedCurrency: Currency;

 @Input() flexType = "flex-column";
 currenciesArray: Currency[] = [
  { name: "Leva", currency: "BGN", price: 1.96, symbol: "лв.", alignSymbolEnd: true },
  { name: "Euro", currency: "EUR", price: 1, symbol: "€", alignSymbolEnd: false },
 ];

 languagesArray: Language[] = [
  { name: "Български", code: "bg" },
  { name: "English", code: "en" },
 ];

 public currencyArray: Currency[] = [...this.currenciesArray]; // Create a shallow copy
 public languageArray: Language[] = [...this.languagesArray]; // Create a shallow copy
 public LanguageCode: string;

 constructor(private baseService: BaseService, private subTracker: SubscriptionTrackerService, private translate: TranslateService) {
  this.settings$ = this.baseService.getSettings;
 }

 ngOnInit() {
  const subSettings = this.settings$.subscribe((x: SettingEntities) => {
   if (x.LanguageEntity) {
    this.LanguageCode = x.LanguageEntity.code;
    this.translate.use(this.LanguageCode);
   }
   this.selectedCurrency = x.CurrencyEntity;
   this.selectedLang = x.LanguageEntity;
  });

  this.subTracker.track({
   subscription: subSettings,
   name: "subSettings",
   fileName: this.componentName,
  });
 }

 ngOnDestroy(): void {
  this.subTracker.releaseAllForComponent(this.componentName);
 }

 async changeLanguage(name) {
  const languageEntity = this.languagesArray?.find((item) => item.name === name);

  this.translate.setDefaultLang(languageEntity?.code);
  this.translate.use(languageEntity?.code);

  await this.baseService.updateLanguage(name);
 }

 async changeCurrency(name) {
  await this.baseService.updateCurrency(name);
 }
}
