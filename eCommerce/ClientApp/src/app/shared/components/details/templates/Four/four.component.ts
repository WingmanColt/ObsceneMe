import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "environments/environment";
import { Observable, of, Subscription, switchMap } from "rxjs";
import { BaseService } from "src/app/Services/base.service";
import { CartService } from "src/app/Services/Cart/cart.service";
import { ProductsService } from "src/app/Services/Product/products.service";
import { SiblingEventService } from "src/app/Services/Siblings/sibling-event.service";
import { BundleItem } from "src/app/shared/classes/bundle";
import { Trademarks } from "src/app/shared/classes/enums/trademarks";
import { Images, MarketStatus, Products, PurchaseStatus } from "src/app/shared/classes/product";
import { ProductDetails } from "src/app/shared/classes/productDetails";
import { Currency } from "src/app/shared/classes/settings";
import { GroupedVariant } from "src/app/shared/classes/variants";

@Component({
 selector: "app-details-template-four",
 templateUrl: "./four.component.html",
 styleUrls: ["./four.component.scss"],
})
export class FourComponent implements OnInit, OnDestroy {

 @Input() product: ProductDetails;
 @Input() thumbImages: Images[];
 @Input() imageObjects: Array<object>;
 @Input() isQuickView: boolean;
 @Input() isMobile: boolean;

 @Input() activeCurrency: Currency;
 @Input() activeImage: string;

 @Input() variants: any[];
 @Input() counter: number;
 @Input() isInCart: PurchaseStatus;

 env = environment;
 detailsSettings = this.env.pagesSettings.DetailsSettings;
 checkoutSettings = this.env.pagesSettings.CheckoutSettings;

 cols: string;
 selectedVariants: GroupedVariant[] = [];
 
 MarketStatus = MarketStatus;
 Trademark = Trademarks;

 purchaseStatus = PurchaseStatus;
 outputMessage: string;
 
 promoText$: Observable<string>;
 private sub!: Subscription;

 @Output() chartModal = new EventEmitter<boolean>();
 @Output() decrement = new EventEmitter<any>();
 @Output() increment = new EventEmitter<any>();

 @Output() addToCart = new EventEmitter<object>();
 @Output() finishPurchase = new EventEmitter<any>();

 constructor(
  private router: Router, 
  public cartService: CartService, 
  private productService: ProductsService,
  public baseService: BaseService,
  private translate: TranslateService,
  private siblingService: SiblingEventService) { }

 ngOnInit(): void {
  this.cols = this.isMobile ? "col-12" : "col-6";
  this.promoText$ = this.getBundlePromoText(this.product);

  this.sub = this.siblingService.emitChange.subscribe(() => {
    // Reset all bundle items
    this.product.bundle?.bundleItems?.forEach(item => (item.checked = false));

    // Reset purchase status
    this.isInCart = this.purchaseStatus.None;
  });
 }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

incrementCounter() {
    this.increment.emit();
}

decrementCounter() {
    this.decrement.emit();
}

AddToCart(mainBtn: boolean, product: Products, instant: boolean) {
  if (product && (product?.quantity == 0 || product?.quantity < this.counter)) {
    this.outputMessage = `You cannot purchase more items than available.`;
    return;
  }
 
  if (mainBtn && this.isInCart !== this.purchaseStatus.Finish) {
    let shouldSelectVariant = true; // if variants are required
    this.addToCart.emit({ product, shouldSelectVariant, instant });
    
  console.log("emited")
  }
}

 FinishPurchase(mainBtn: boolean) {
  if (mainBtn && this.isInCart !== this.purchaseStatus.Finish) {
   this.finishPurchase.emit();
  }

  if (mainBtn && this.isInCart === this.purchaseStatus.Finish) {
   return;
  }

  if (!mainBtn && this.isInCart === this.purchaseStatus.Finish) {
   this.finishPurchase.emit();
  }
 }

 handleCategoriesRouting(both?: boolean): void {
  this.router.navigate(['/shop'], {
    queryParams: {
      categoryId: this.product.categoryId || null,
      subCategoryId: both ? this.product.subCategoryId || null : null
    }
  });
 }

  openChartModal($event) {
    this.chartModal.emit($event);
  }

  setActiveImage($event: string): void {
    this.activeImage = $event;
  }

  updateCurrency(val: any) {
    return (val * this.activeCurrency?.price)?.toFixed(2);
  }
  getEnumKeyByValue(value: number): string | undefined {
    return Object.keys(Trademarks).find(key => Trademarks[key as keyof typeof Trademarks] === value);
  }
async onBundleChange($event): Promise<void> {
  const { bundle, selectedItem } = $event;
  this.isInCart = this.purchaseStatus.Processing;

  const allProducts = await this.productService.getProductsAsync();
  const product = allProducts.find(p => p.id === selectedItem.productId);

  if (!product) {
    console.warn('Product not found for bundle item:', selectedItem);
    this.isInCart = this.purchaseStatus.None;
    return;
  }

  // Always remove first
  await this.cartService.removeCartItem(product);

  if (selectedItem.checked) {
    // Only add back if the item is checked
    await this.cartService.addToCartAsync(
      this.product,
      1,
      product.variants,
      [selectedItem]
    );

    setTimeout(() => {
      this.isInCart = this.purchaseStatus.Finish;
    }, 500);
  } else {
    // Nothing selected → mark cart as empty for this bundle
    setTimeout(() => {
      this.isInCart = this.purchaseStatus.None;
    }, 500);
  }

}


  get selectedBundleItem(): BundleItem | null {
    return this.product.bundle?.bundleItems?.find(item => item.checked) || null;
  }

  getBundlePromoText(product: ProductDetails): Observable<string> {
  if (product.bundle.type !== 0 || !product.bundle.bundleItems?.length) return of('');

  const count = product.bundle.bundleItems.length;
  let discount = 0;

  if (count >= 5) discount = 30;
  else if (count === 4) discount = 25;
  else if (count === 3) discount = 20;
  else if (count === 2) discount = 10;

  if (discount === 0) return of('');

  return this.translate.get('ORDINAL.' + count).pipe(
    switchMap((ordinal: string) => 
      this.translate.get('BUNDLE_PROMO.TEXT', {
        count,
        discount,
        ordinal
      })
    )
  );
}

}
