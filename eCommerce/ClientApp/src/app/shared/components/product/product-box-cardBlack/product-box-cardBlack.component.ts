import { Component, Input, ViewChild } from "@angular/core";
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { MarketStatus, Products } from "../../../classes/product";
import { environment } from "environments/environment";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { BaseService } from "src/app/Services/base.service";

@Component({
 selector: "app-product-box-cardBlack",
 templateUrl: "./product-box-cardBlack.component.html",
 styleUrls: ["./product-box-cardBlack.component.scss"],
})
export class ProductBoxCardBlackComponent {
 @Input() product: Products;

 @ViewChild("quickView") QuickView: QuickViewComponent;

 defaultImage: string = environment.placeholderSrc;
 MarketStatus = MarketStatus;
 settings = environment.cardsSettings.blackCardSettings;

 constructor(public deviceDetector: BreakpointDetectorService, public baseService: BaseService) {}

 public MarketStatusEnum(item: MarketStatus) {
  return this.product.marketStatus === item;
 }
}
