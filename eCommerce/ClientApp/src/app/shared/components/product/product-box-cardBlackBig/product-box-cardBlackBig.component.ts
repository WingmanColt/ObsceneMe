import { Component, Input, ViewChild } from "@angular/core";
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { MarketStatus, Products } from "../../../classes/product";
import { environment } from "environments/environment";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { BaseService } from "src/app/Services/base.service";

@Component({
 selector: "app-product-box-cardBlackBig",
 templateUrl: "./product-box-cardBlackBig.component.html",
 styleUrls: ["./product-box-cardBlackBig.component.scss"],
})
export class ProductBoxCardBlackBigComponent {
 @Input() product: Products;

 @ViewChild("quickView") QuickView: QuickViewComponent;

 defaultImage: string = environment.placeholderSrc;
 MarketStatus = MarketStatus;
 settings = environment.cardsSettings.blackCardBigSettings;

 constructor(public baseService: BaseService, public deviceDetector: BreakpointDetectorService) {}

 MarketStatusEnum(item: MarketStatus) {
  return this.product.marketStatus === item;
 }
}
