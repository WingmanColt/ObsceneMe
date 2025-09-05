import { Component, Input, ViewChild, ElementRef } from "@angular/core";
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { Products } from "../../../classes/product";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";

@Component({
 selector: "app-product-box-cardMinimal",
 templateUrl: "./product-box-cardMinimal.component.html",
 styleUrls: ["./product-box-cardMinimal.component.scss"],
})
export class ProductBoxCardMinimalComponent {
 @Input() product: Products;
 @Input() multiButtons: boolean;
 @Input() class: string;

 @ViewChild("el") element: ElementRef;
 @ViewChild("quickView") QuickView: QuickViewComponent;

 defaultImage: string = environment.placeholderSrc;
 settings = environment.cardsSettings.minimalCardSettings;

 constructor(public baseService: BaseService) {}
}
