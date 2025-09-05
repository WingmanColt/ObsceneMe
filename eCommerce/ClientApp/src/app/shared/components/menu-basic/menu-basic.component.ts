import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "../../services/nav.service";
import { Menu } from "../../classes/menu";
import { SubscriptionTrackerService } from "src/app/Services/Tracker/subscription-tracker.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-menu-basic",
  templateUrl: "./menu-basic.component.html",
  styleUrls: ["./menu-basic.component.scss"],
})
export class MenuBasicComponent implements OnInit, OnDestroy {
  componentName: string = "MenuBasicComponent";
  menuItems: Menu[];

  constructor(
    private router: Router, 
    private navServices: NavService,  
    private subTracker: SubscriptionTrackerService) {
  }

  ngOnInit(): void {
       this.loadNav();
  }

  
  loadNav(): void {
    const subNavMenuBasic = this.navServices.items.subscribe((menuItems) => {
        this.menuItems = menuItems;
    });

    this.subTracker.track({
      subscription: subNavMenuBasic,
      name: "subNavMenuBasic",
      fileName: this.componentName,
    });
  }

  navigateToLink(link: string): void {
    this.router.navigate([link], { queryParams: {} });
   }
  
  ngOnDestroy(): void {
    this.subTracker.releaseAllForComponent(this.componentName);
  }


}
