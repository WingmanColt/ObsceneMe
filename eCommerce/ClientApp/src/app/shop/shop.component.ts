import { Component, OnInit, OnDestroy } from "@angular/core";
import { NavigationEnd, Router, Event } from "@angular/router";
import { Subscription } from "rxjs";
import { environment } from "environments/environment";

@Component({
  selector: "app-shop",
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.scss"],
})
export class ShopComponent implements OnInit, OnDestroy {
  public pagesSetting = environment.pagesSettings;
  public detailsSetting = this.pagesSetting.DetailsSettings;
  public homeType = environment.homeSettings.homeType;
  public headerType: number = 0;
  
  private routerSubscription!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Subscribe to router events
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;

        // Use includes() instead of match() for a lighter comparison
        if (currentUrl.includes("/shop/product/info/")) {
          this.headerType = this.detailsSetting.headerType;
        } else if (currentUrl.includes("/shop")) {
          this.headerType = this.pagesSetting.CollectionSettings.headerType;
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
