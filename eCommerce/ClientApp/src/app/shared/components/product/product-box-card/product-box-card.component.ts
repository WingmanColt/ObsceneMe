import { Component, Input, ViewChild, ElementRef } from "@angular/core";
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { Products } from "../../../classes/product";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";

@Component({
 selector: "app-product-box-card",
 templateUrl: "./product-box-card.component.html",
 styleUrls: ["./product-box-card.component.scss"],
})
export class ProductBoxCardComponent {
 @Input() product: Products;
 @Input() multiButtons: boolean;

 @ViewChild("el") element: ElementRef;
 @ViewChild("quickView") QuickView: QuickViewComponent;

 defaultImage: string = environment.placeholderSrc;
 settings = environment.cardsSettings.cardCardSettings;

 constructor(public baseService: BaseService) {}
}
