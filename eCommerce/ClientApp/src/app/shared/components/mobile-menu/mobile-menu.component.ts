import { Component, OnDestroy, OnInit, Renderer2, RendererFactory2 } from "@angular/core";
import { NavService } from "../../services/nav.service";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { Menu } from "../../classes/menu";
import { BaseService } from "src/app/Services/base.service";
import { Subject, debounceTime, takeUntil } from "rxjs";

@Component({
 selector: "app-menu",
 templateUrl: "./mobile-menu.component.html",
 styleUrls: ["./mobile-menu.component.scss"],
})
export class MobileMenuComponent implements OnInit, OnDestroy {
 componentName: string = "MenuComponent";
 env = environment;

 isMobileMenuOpen: boolean = false;
 menuItems: Menu[];
 renderer: Renderer2;

 private destroy$ = new Subject<void>(); // Subject for managing component destruction
 
 constructor(
  private router: Router, 
  private baseService: BaseService,
  private navServices: NavService, 
  private rendererFactory: RendererFactory2) {
  this.renderer = this.rendererFactory.createRenderer(null, null);
 }

 ngOnInit(): void {
  this.initSubscriptions();
 }

private initSubscriptions(): void {
  this.navServices.items
    .pipe(takeUntil(this.destroy$))
    .subscribe((menuItems) => (this.menuItems = menuItems));

  this.baseService.menuState$
    .pipe(takeUntil(this.destroy$))
    .subscribe(menuState => {
      this.isMobileMenuOpen = menuState.isMobileMenuOpen;

      if (this.isMobileMenuOpen) {
        document.body.classList.add('body-no-scroll');
      } else {
        document.body.classList.remove('body-no-scroll');
      }
    });
}

openMobileMenu(): void {
  this.baseService.updateMenuState({ isMobileMenuOpen: true });
}

closeMobileMenu(): void {
  this.baseService.updateMenuState({ isMobileMenuOpen: false });
}


ngOnDestroy(): void {
 this.closeMobileMenu();

 this.destroy$.next();
 this.destroy$.complete();
}


 // Click Toggle menu (Mobile)
 toggletNavActive(item) {
  item.active = !item.active;
 }
 
 navigateToLink(link: string): void {
  this.router.navigate([link], { queryParams: {} });
 }

}
