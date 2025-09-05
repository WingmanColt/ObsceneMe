import { Component, Input, ElementRef, ViewChild, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CartMenuComponent } from "../../components/cart-menu/cart-menu.component";
import { environment } from "environments/environment";
import { debounceTime, distinctUntilChanged, fromEvent, map, Observable, shareReplay, startWith, Subject, Subscription, takeUntil } from "rxjs";
import { CartService } from "src/app/Services/Cart/cart.service";
import { SearchBarComponent } from "../../components/searchbar/searchbar.component";
import { AccountService } from "src/app/Services/Account/account.service";
import { FavouritesService } from "src/app/Services/Favourites/favourites.service";
import { UserAccountModalService } from "src/app/Services/Modal/userAccountModal.service";
import { MobileMenuComponent } from "../../components/mobile-menu/mobile-menu.component";
import { CartItemState } from "../../classes/cart";
import { AuthResponse } from "../../classes/account";
import { TranslateService } from "@ngx-translate/core";
import { BaseService } from "src/app/Services/base.service";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";

@Component({
    selector: "app-header-one",
    templateUrl: "./header-one.component.html",
    styleUrls: ["./header-one.component.scss"],
})
export class HeaderOneComponent implements OnInit, OnDestroy {
  componentName: string = "HeaderTwoComponent";
  settings = environment;
  checkoutSettings = this.settings.pagesSettings.CheckoutSettings;

  @Input() sticky: boolean;
  stick: boolean;

  @Input() invisibleBottomMenu: boolean;
  @Input() transparentHome: boolean;

  @Input() class: string = ""; // Ensure default values are set
  @Input() topbar: boolean = true; // Default True
  @Input() headerType: number;

  MobileMenuComponentVisible = false;
  MobileMenuComponent: any = MobileMenuComponent;

  CartMenuComponentVisible = false;
  CartMenuComponent: any = CartMenuComponent;

  SearchBarComponentVisible = false;
  SearchBarComponent: any = SearchBarComponent;

  isMobile: boolean = false;
  isMobileMenuOpen: boolean = false;
  isCartMenuOpen: boolean = false;
  isSearchOpen: boolean = false;
  isUserPanelOpen: boolean = false;

  firstPart: string = '';
  secondPart: string = '';

  cartLength: number;
  favourites: CartItemState[];
  private destroy$ = new Subject<void>();
  private currentUser: AuthResponse;

  constructor(
    private baseService: BaseService,
    private accountService: AccountService,
    private favouriteService: FavouritesService,
    private cartService: CartService,
    private router: Router,
    private translateService: TranslateService,
    private accountModalService: UserAccountModalService,
    private breakpointService: BreakpointDetectorService
  ) {
    this.isMobile = this.breakpointService.isDevice("Mobile"); // Check if the device is mobile
  }

  ngOnInit(): void {
    this.initSubscriptions();

    const webName = this.settings.webName || '';
    const splitName = webName.split('.');
    this.firstPart = splitName[0];
    this.secondPart = splitName[1] || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initSubscriptions(): void {
    // Subscribe to router events to close menus
    this.router.events.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
    this.resetAllMenuStates();
    });

    this.accountService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to cart length
    this.cartService.cartLength$.pipe(takeUntil(this.destroy$)).subscribe((count: number) => {
    this.cartLength = count;
    });

    // Subscribe to favorite products
    this.favouriteService.favProducts$.pipe(takeUntil(this.destroy$)).subscribe((favourites: CartItemState[]) => {
    this.favourites = favourites;
    });

    // create one observable for 4 props
    this.baseService.menuState$
    .pipe(takeUntil(this.destroy$))
    .subscribe(menuState => {
      this.isMobileMenuOpen = menuState.isMobileMenuOpen;
      this.isSearchOpen = menuState.isSearchOpen;
      this.isCartMenuOpen = menuState.isCartMenuOpen;
      this.isUserPanelOpen = menuState.isUserPanelOpen;
    });
  
}

resetAllMenuStates() {
  this.baseService.updateMenuState({
    isMobileMenuOpen: false,
    isSearchOpen: false,
    isCartMenuOpen: false,
    isUserPanelOpen: false
  });
}
  baseMenuToggle(): void {
    if (!this.isSearchOpen && !this.isCartMenuOpen && !this.isUserPanelOpen) {
        this.isMobileMenuOpen = !this.isMobileMenuOpen; 
       this.baseService.updateMenuState({ isMobileMenuOpen: this.isMobileMenuOpen });

       this.MobileMenuComponentVisible = this.isMobileMenuOpen ? true : false; 
    } 
  }

  cartMenuToggle(): void {
    if (!this.isMobileMenuOpen && !this.isSearchOpen && !this.isUserPanelOpen) {
      this.isCartMenuOpen = !this.isCartMenuOpen; 
      this.baseService.updateMenuState({ isCartMenuOpen: this.isCartMenuOpen });

      this.CartMenuComponentVisible = this.isCartMenuOpen ? true : false; 
    }
  }

  searchBarToggle($event): void {
    if (!this.isMobileMenuOpen && !this.isCartMenuOpen && !this.isUserPanelOpen) {
      this.isSearchOpen = $event ?? !this.isSearchOpen; 
      this.baseService.updateMenuState({ isSearchOpen: this.isSearchOpen });

      this.SearchBarComponentVisible = this.isSearchOpen ? true : false; 
     } 
}
  

async userSettingsToggle(): Promise<boolean> {
  const cachedUser = this.currentUser; // ✅ Use already stored data

  if (!this.isMobileMenuOpen && !this.isCartMenuOpen && !this.isSearchOpen) {
    if (cachedUser?.isAuthenticated && cachedUser?.isEmailConfirmed) {
      return this.router.navigate(["/pages/account/user-info"]);
    } else {
      this.isUserPanelOpen = !this.isUserPanelOpen;
      this.baseService.updateMenuState({ isUserPanelOpen: this.isUserPanelOpen });

      if (this.isUserPanelOpen) {
        await this.accountModalService.openModal('LoginPage', false);
      } else {
        await this.accountModalService.closeModal();
      }

      return this.isUserPanelOpen;
    }
  }
  return false;
}

    get freeShippingText(): string {
        return `${this.translateService.instant("Free Shipping after")} ${this.baseService.calcCurrency(this.checkoutSettings.freeShippingAfter)}`;
    }

    get isPrivacyPageEnabled(): boolean {
        return this.settings.pagesSettings.PrivacySettings.PrivacyPageEnable;
    }

    get isFAQPageEnabled(): boolean {
        return this.settings.pagesSettings.FAQSettings.FAQPageEnable;
    }

    get isAboutUsPageEnabled(): boolean {
        return this.settings.pagesSettings.AboutSettings.AboutUsPageEnable;
    }

    get isAccountSystemEnabled(): boolean {
        return this.settings.accountSetting.AccountSystem;
    }

    get isActiveDotOnUser(): boolean {
        return this.settings.homeSettings.activeDotOnUser;
    }

    get isSearchWithInputEnabled(): boolean {
        return this.settings.homeSettings.searchWithInput;
    }

    get isActiveDot(): boolean {
        return this.settings.homeSettings.activeDot;
    }

    get dotColorOnBasket(): string {
        return this.settings.homeSettings.dotColorOnBasket;
    }

    get dotColorOnUser(): string {
        return this.settings.homeSettings.dotColorOnUser;
    }

    get dotMobileColorOnBasket(): string {
        return this.settings.homeSettings.dotMobileColorOnBasket;
    }

    get dotMobileColorOnUser(): string {
        return this.settings.homeSettings.dotMobileColorOnUser;
    }

    get containerClass(): string {
        return this.isMobile ? 'container-fluid' : 'container container-xxxl';
    }

    get headerClasses(): { [key: string]: boolean } {
        return {
            'fixed': this.stick && this.sticky,
            'invisibleBottomMenu': this.invisibleBottomMenu,
            'transparentHome': this.transparentHome
        };
    }
}
