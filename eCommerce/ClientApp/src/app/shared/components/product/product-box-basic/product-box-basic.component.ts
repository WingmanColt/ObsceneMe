import { Component, Input, ViewChild, ElementRef } from "@angular/core";
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { Products } from "../../../classes/product";
import { Currency } from "src/app/shared/classes/settings";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";

@Component({
 selector: "app-product-box-basic",
 templateUrl: "./product-box-basic.component.html",
 styleUrls: ["./product-box-basic.component.scss"],
})
export class ProductBoxBasicComponent {
 @Input() product: Products;

 @ViewChild("el") element: ElementRef;
 @ViewChild("quickView") QuickView: QuickViewComponent;

 defaultImage: string = environment.placeholderSrc;
 settings = environment.cardsSettings.basicCardSettings;

 constructor(public baseService: BaseService) {}
}
