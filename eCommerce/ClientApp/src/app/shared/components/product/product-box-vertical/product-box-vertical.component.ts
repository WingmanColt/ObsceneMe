import { Component, Input } from "@angular/core";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";
import { ProductShort } from "src/app/shared/classes/products/productShort";

@Component({
 selector: "app-product-box-vertical",
 templateUrl: "./product-box-vertical.component.html",
 styleUrls: ["./product-box-vertical.component.scss"],
})
export class ProductBoxVerticalComponent{
 @Input() product: ProductShort;

 defaultImage: string = environment.placeholderSrc;

 constructor(public baseService: BaseService) { }

}
