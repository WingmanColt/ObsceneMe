import { Component, Input } from "@angular/core";
import { MarketStatus } from "src/app/shared/classes/product";

@Component({
 selector: "app-badges",
 templateUrl: "./badges.component.html",
 styleUrls: ["./badges.component.scss"],
})
export class BadgesComponent {
 @Input() badgeClass: string;
 @Input() settings;
 @Input() marketStatus: MarketStatus;

 MarketStatus = MarketStatus;
}
