import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { environment } from "../../../environments/environment";
import { Currency, Language, SettingEntities, Settings } from "../shared/classes/settings";
import AsyncLocalStorage from "@createnextapp/async-local-storage";
import { BehaviorSubject, Observable, shareReplay, switchMap, map, of } from "rxjs";
import { SubscriptionTrackerService } from "./Tracker/subscription-tracker.service";
import { TranslateService } from '@ngx-translate/core';

interface MenuState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartMenuOpen: boolean;
  isUserPanelOpen: boolean;
}


@Injectable({
  providedIn: "root"
})
export class BaseService {

  private componentName: string = "BaseService";
  private env = environment;
  private state: { settings: Settings };

  public currenciesArray: Currency[] = this.env.countriesSettings.currenciesArray;
  public languagesArray: Language[] = this.env.countriesSettings.languagesArray;

  public defaultCurrency: Currency = this.env.countriesSettings.currenciesArray[0];
  public defaultLanguage: Language = this.env.countriesSettings.languagesArray[0];

  public activeCurrency$ = new BehaviorSubject<Settings>(new Settings(this.defaultLanguage.name, this.defaultCurrency.name)); //Subject<Settings> = new ReplaySubject<Settings>(1);
  public activeCurrency: Currency;
  public getCurrency = this.activeCurrency$;

  private menuStateSubject = new BehaviorSubject<MenuState>({
    isMobileMenuOpen: false,
    isSearchOpen: false,
    isCartMenuOpen: false,
    isUserPanelOpen: false
  });
  
  menuState$ = this.menuStateSubject.asObservable();


  constructor(private datePipe: DatePipe, private translateService: TranslateService, private subTracker: SubscriptionTrackerService) {
    this.currencyInitialization();
  }


  private currencyInitialization() {
    // Initialize this.state inside the constructor using default values
    this.state = {
      settings: {
        currency: this.defaultCurrency.name,
        language: this.defaultLanguage.name,
      },
    };

    const subCurrency = this.getSettings.subscribe((settings) => {
      this.activeCurrency = settings.CurrencyEntity;
    });

    this.subTracker.track({ subscription: subCurrency, name: "subCurrency", fileName: this.componentName });
  }


  calcCurrency(val: number) {
    const calculatedVal = (val * this.activeCurrency?.price);
    return calculatedVal.toFixed(2);
  }

  calculatePercent(price: number, Rate: number): number {
    return price * Rate;
  }

  getImageFull(imageSrc: string, productId: number): string {
    // Check for null, undefined, or empty imageSrc and return placeholderSrc if true
    if (!imageSrc || imageSrc.trim().length === 0) {
      return this.env.placeholderSrc;
    }
  
    // Otherwise, return the full image URL
    return this.getImageSrc(imageSrc, productId);
  }
  
  private getImageSrc(imageSrc: string, productId: number): string {
    // Check for null or undefined imageSrc and return placeholderSrc if true
    if (!imageSrc || imageSrc.trim().length === 0) {
      return this.env.placeholderSrc;
    }
  
    // If imageSrc starts with "http", return it as is, else build the URL
    return imageSrc.startsWith("http") ? imageSrc : `assets/images/products/${productId}/${imageSrc}`;
  }
  

  sanitizeTitle(title: string): string {
  // Replace invalid file system characters with an underscore
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g; // Regex for invalid file/folder characters
  const sanitizedTitle = title.replace(invalidChars, '_');

  // Trim spaces and normalize the title
  return sanitizedTitle.trim();
}

  // Used in AppComponent
  async initializeSettings() {
    try {
      const storedSettings = await AsyncLocalStorage.getItem("settings");
      if (storedSettings) {
        this.state.settings = JSON.parse(storedSettings);
        this.activeCurrency$.next(this.state.settings);
      } else {
        this.setDefaultSettings();
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      this.setDefaultSettings();
    }
  }

  private setDefaultSettings() {
    this.state.settings = {
      currency: this.defaultCurrency.name,
      language: this.defaultLanguage.name,
    };
    this.activeCurrency$.next(this.state.settings);
  }


  public getSettings = this.activeCurrency$.pipe(
    switchMap((Val) =>
      this.getSettingsstate().pipe(
        map((setting: Settings) => {
          const currency = setting?.currency !== null && setting?.currency !== undefined ? setting?.currency : Val.currency;
          const language = setting?.language !== null && setting?.language !== undefined ? setting?.language : Val.language;

          const res = new SettingEntities(
            this.currenciesArray?.find((item) => item.name === currency),
            this.languagesArray?.find((item) => item.name === language)
          );
          return res;
        })
      )
    ),
    shareReplay(1)
  );

  updateMenuState(newState: Partial<MenuState>) {
    this.menuStateSubject.next({
      ...this.menuStateSubject.value,
      ...newState,
    });
  }
  

  public setActiveCurrency(value: { currency: string; language: string }) {
    this.activeCurrency$.next(value);
  }

  public getSettingsstate(): Observable<Settings> {
    return of(this.state.settings);
  }


  public async updateCurrency(currencyName: string): Promise<boolean> {
    const currencyEntity = this.currenciesArray?.find((item) => item.name === currencyName);
    if (!currencyEntity) return false;

    // Updated this part
    this.state.settings = { ...this.state.settings, currency: currencyName };
    await this.storeAsync("settings", JSON.stringify(this.state.settings));
    this.setActiveCurrency({ currency: currencyName, language: this.state.settings.language });
    return true;
  }

  public async updateLanguage(languageName: string): Promise<boolean> {
    const languageEntity = this.languagesArray?.find((item) => item.name === languageName);
    if (!languageEntity) return false;

    // Update without mutating the original object
    this.state.settings = { ...this.state.settings, language: languageName };

    await this.storeAsync("settings", JSON.stringify(this.state.settings));
    this.setActiveCurrency({ currency: this.state.settings.currency, language: languageName });

    return true;
  }

  formatDateBasedOnLocale(date: string): string {
    const dateObject = new Date(date);
    const formattedDate = this.datePipe.transform(dateObject, 'dd MMMM yyyy HH:mm', 'bg-BG');
    return formattedDate || '';
  }

  getFormattedDate(date: string, includeMinutesSeconds: boolean): string {
    // Convert the input string to a Date object
    const dateObject = new Date(date);

    // Format the date using DatePipe
    const formattedDate = this.datePipe.transform(dateObject, includeMinutesSeconds ? 'dd MMMM yyyy HH:mm' : 'dd MMMM yyyy');

    // Extract the month for translation
    const month = this.datePipe.transform(dateObject, 'MMMM');

    // Translate the month using ngx-translate
    const translatedMonth = this.translateService.instant(`${month}`);

    // Combine the formatted date parts, replacing the month in the original formattedDate
    const finalFormattedDate = formattedDate.replace(month, translatedMonth);

    return finalFormattedDate;
  }

  public getPager(totalItems: number, currentPage: number = 1, pageSize: number = 5) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // Paginate Range
    let paginateRange = 3;

    // ensure current page isn't out of range
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage < paginateRange - 1) {
      startPage = 1;
      endPage = startPage + paginateRange - 1;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array(endPage + 1 - startPage).keys()).map((i) => startPage + i);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages,
    };
  }

  // Async LocalStorage

  private async storeAsync(key: string, stateSetting: string): Promise<boolean> {
    try {
      await AsyncLocalStorage.setItem(key, stateSetting);
      return true;
    } catch (e) {
      console.error("Error storing data:", e);
      throw e;
    }
  }
}
