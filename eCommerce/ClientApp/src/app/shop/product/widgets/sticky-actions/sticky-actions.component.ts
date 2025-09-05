import { Component, EventEmitter, Input, Output } from "@angular/core";
import { environment } from "environments/environment";
import { Products } from "src/app/shared/classes/product";

@Component({
 selector: "app-sticky-actions",
 templateUrl: "./sticky-actions.component.html",
 styleUrls: ["./sticky-actions.component.scss"],
})
export class StickyActionsComponent {
 detailsSettings = environment.pagesSettings.DetailsSettings;
 selectedVariants: [] = [];

 @Input() product: Products;
 @Input() variants: any[];
 @Input() isInCart: number;
 @Input() counter: number;

 @Output() decrement = new EventEmitter<any>();
 @Output() increment = new EventEmitter<any>();

 @Output() addToCart = new EventEmitter<object>();
 @Output() finishPurchase = new EventEmitter<any>();

 decrementCounter() {
  this.decrement.emit();
 }
 incrementCounter() {
  this.increment.emit();
 }
 AddToCart(product: Products, instant: boolean) {
  let shouldSelectVariant = this.variants.length > 0 && this.selectedVariants.length <= 0;
  this.addToCart.emit({ product, shouldSelectVariant, instant });
 }
 FinishPurchase() {
  this.finishPurchase.emit();
 }
}
