import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";
import { Images, Products } from "src/app/shared/classes/product";
import { Currency } from "src/app/shared/classes/settings";

@Component({
 selector: "app-details-template-one",
 templateUrl: "./one.component.html",
 styleUrls: ["./one.component.scss"],
})
export class OneComponent implements OnInit {
 env = environment;
 detailsSettings = this.env.pagesSettings.DetailsSettings;

 cols: string;
 selectedVariants: [] = [];

 @Input() product: Products;
 @Input() thumbImages: Images[];
 @Input() imageObjects: Array<object>;
 @Input() isQuickView: boolean;
 @Input() isMobile: boolean;

 @Input() activeCurrency: Currency;
 @Input() activeImage: string;

 @Input() variants: any[];
 @Input() counter: number;
 @Input() isInCart: number;

 @Output() chartModal = new EventEmitter<boolean>();
 @Output() decrement = new EventEmitter<any>();
 @Output() increment = new EventEmitter<any>();

 @Output() addToCart = new EventEmitter<object>();
 @Output() finishPurchase = new EventEmitter<any>();

 constructor(public baseService: BaseService) {}

 ngOnInit(): void {
  this.cols = this.isMobile ? "col-12" : "col-6";
  console.log(this.product);
 }

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

 openChartModal($event) {
  this.chartModal.emit($event);
 }

 selectedItems($event) {
  this.selectedVariants = $event;
 }
 updateCurrency(val: any) {
  return (val * this.activeCurrency?.price)?.toFixed(2);
 }
}
