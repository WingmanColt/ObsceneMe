import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Observable, Subject, map, take, takeUntil } from "rxjs";
import { CartService } from "src/app/Services/Cart/cart.service";
import { ProductsService } from "src/app/Services/Product/products.service";
import { ReviewsService } from "src/app/Services/Review/reviews.service";
import { Products, PurchaseStatus } from "src/app/shared/classes/product";
import { environment } from "environments/environment";
import { AlertModalComponent } from "../modal/alert-modal/alert-modal.component";
import { SizeModalComponent } from "../modal/size-modal/size-modal.component";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { ProductDetails } from "../../classes/productDetails";
import { BundleItem } from "../../classes/bundle";

@Component({
  selector: "app-product-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"],
})

export class DetailsComponent implements OnInit, OnDestroy {

  componentName: string = "DetailsComponent";
  detailsSettings = environment.pagesSettings.DetailsSettings;

  @Input() productQuery: string;
  @Input() isQuickView: boolean;
  @Input() template: string;

  @Input() swiperTemplate: string;

  @Output() isLoaded = new EventEmitter<boolean>();
  @Output() Product = new EventEmitter<ProductDetails>();

  foundProduct: ProductDetails = {};
  product$: Observable<ProductDetails>;
  isProductLoaded: boolean = true;

  isInCart: PurchaseStatus = PurchaseStatus.None;
  counter: number = 1;

  starsHover: number;
  StarsArray: number[] = [];
  purchaseStatus = PurchaseStatus;
  isMobile: boolean;

  @ViewChild("alertModal") AlertModal: AlertModalComponent | undefined;
  @ViewChild("sizeChart") SizeChart: SizeModalComponent | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    public _sanitizer: DomSanitizer, 
    public router: Router, 
    public productService: ProductsService, 
    public cartService: CartService, 
    public reviewService: ReviewsService, 
    public deviceDetector: BreakpointDetectorService) { }

  ngOnInit() {
    this.isMobile = this.deviceDetector.isDevice('Mobile');

    this.product$ = this.productService.productDetails$(this.productQuery).pipe(
      takeUntil(this.destroy$),
      take(1),
      map((response: ProductDetails) => {
        this.isLoaded.emit(true);
        this.Product.emit(response);
        
        if(response != null) {
          // Check if the product is in the cart asynchronously
          this.cartService.isInCart(response).then(cartItem => {
            if (cartItem) {
              this.isInCart = this.purchaseStatus.Finish;
              this.counter = cartItem.customerPreferenceQuantity;
              response.variants = cartItem.selectedVariants;
            } 
          }).catch(error => {
            console.error('Error checking cart:', error);
          });
        }


        return response;
      })
    );

    if(this.foundProduct) {
        this.cartService.cartProducts$
              .pipe(takeUntil(this.destroy$))
              .subscribe(([products, count]) => {
        
                // Check if the current product is in cartItems
                if (this.foundProduct.id && !products.some(item => item.id === this.foundProduct.id)) {
                  this.isInCart = this.purchaseStatus.None;
                }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // Increament
  async increment(product: Products) {
    this.counter = this.cartService.getProductQuantity(product);
    if (product.quantity > this.counter) {
      this.counter++;
      await this.cartService.changeProductQuantity(product, true);
    }
  }

  // Decrement
  async decrement(product: Products) {
    this.counter = this.cartService.getProductQuantity(product);
    if (this.counter > 1) {
      this.counter--;
      await this.cartService.changeProductQuantity(product, false);
    }
  }

  finishPurchase() {
    setTimeout(() => {
      this.router.navigate(["/shop/checkout"]);
    }, 100);
  }

  async addToCart($event) {
    // if (!this.errorMessages($event.product, this.counter, $event.shouldSelectVariant)) return;

    if (!$event.instant) {
      console.log(this.isInCart)
      if (this.isInCart != this.purchaseStatus.None) return;

      console.log($event, this.isInCart)
      this.isInCart = this.purchaseStatus.Processing;
      console.log($event, this.isInCart)
     // const variants = await this.filterArrays($event.product);

      await this.cartService.addToCartAsync($event.product, this.counter, $event.product.variants).then((result) => {
        setTimeout(() => {
          this.isInCart = result ? this.purchaseStatus.Finish : this.purchaseStatus.None;
        }, 500);
      });
    } else {
     // const variants = await this.filterArrays($event.product);
      await this.cartService.addToCartAsync($event.product, this.counter, $event.product.variants).then(() => {
        this.finishPurchase();
      });
    }
  }

  async addToCartBundle(product: Products, bundleItems: BundleItem[], shouldSelectVariant: boolean) {
    if (!this.errorMessages(product, this.counter, shouldSelectVariant)) return;

    bundleItems.forEach(async (item) => {
      if (item.checked) {
     // const variants = await this.filterArrays(product);
      await this.cartService.addToCartAsync(product, this.counter, undefined);
      }
    });
  }

  // Add to Wishlist

  onRateHover($event: any) {
    this.starsHover = $event;
  }

   onRateChange(stars: number) {
    switch (stars) {
      case 0: return "Not recommended";
      case 1: return "Weak";
      case 2: return "Average";
      case 3: return "Good";
      case 4: return "Excellent";
      case 5: return "Excellent";
      default: return "Not rated";
    }
  }

  calculateStars(product: Products) {
    for (var i = 1; i < 6; i++) {
      const counter = product?.reviews?.filter((x) => x.productStars === i).length;
      this.StarsArray.push(counter);
    }
    return 0;
  }

  errorMessages(product: Products, quantity: number, shouldSelectVariant: boolean): boolean {
    if (shouldSelectVariant) {
      this.AlertModal.text = `Please select variant before making a purchase.`;
      this.AlertModal.icon = "play las la-exclamation";
      this.AlertModal.iconColor = "color:#CD7951;";
      this.AlertModal?.openModal();
      return false;
    }

    if (product && (product?.quantity == 0 || product?.quantity < quantity)) {
      const strItem = product.quantity > 1 ? "items" : "item";
      this.AlertModal.text = `You cannot purchase more ${strItem} than available.`;
      this.AlertModal.icon = "play las la-shopping-cart";
      this.AlertModal.iconColor = "color:#fff;";
      this.AlertModal?.openModal();
      return false;
    }

    return true;
  }
}
