import { Component, Input } from "@angular/core";
import { Products } from "src/app/shared/classes/product";

@Component({
 selector: "app-product-base",
 templateUrl: "./product-base.component.html",
 styleUrls: ["./product-base.component.scss"],
})
export class ProductBaseComponent {
 @Input() template: string;
 @Input() product: any;
 @Input() class: string;

 constructor() { }
}
