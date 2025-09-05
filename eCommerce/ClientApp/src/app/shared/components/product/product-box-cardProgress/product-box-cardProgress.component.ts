import { Component, Input } from "@angular/core";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";
import { Products } from "src/app/shared/classes/product";

@Component({
 selector: "app-product-box-card-progress",
 templateUrl: "./product-box-cardProgress.component.html",
 styleUrls: ["./product-box-cardProgress.component.scss"],
})
export class ProductBoxProgressComponent {
 @Input() product: Products;

 defaultImage: string = environment.placeholderSrc;
 settings = environment.cardsSettings.basicCardSettings;
 hover: boolean = false;
 currentImageIndex: number = 0;
 intervalId: any;

 constructor(public baseService: BaseService) {}

 onMouseEnter(): void {
  this.hover = true;
  this.startImageRotation();
 }

 onMouseLeave(): void {
  this.hover = false;
  this.stopImageRotation();
 }

 startImageRotation(): void {
  this.intervalId = setInterval(() => {
   this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images?.length;
  }, 1000);
 }

 stopImageRotation(): void {
  clearInterval(this.intervalId);
 }
}
