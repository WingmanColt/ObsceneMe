import { Component, Input, OnInit } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { CartService } from "src/app/Services/Cart/cart.service";
import { BaseService } from "src/app/Services/base.service";
import { Discount } from "src/app/shared/classes/discount";
import { Products } from "src/app/shared/classes/product";
import { ProductById } from "src/app/shared/classes/products/productById";
import { Shipping } from "src/app/shared/classes/shipping";

@Component({
  selector: "app-cart-column",
  templateUrl: "./cart-column.component.html",
  styleUrl: "./cart-column.component.scss",
})
export class CartColumnComponent implements OnInit {
  env = environment;

  @Input() products: ProductById[];
  @Input() appliedCoupons: Discount[];
  @Input() selectedShippingModel: Shipping;
  @Input() totalDiscount: number;

  quantity: number;
  isLoading: boolean = false;

  constructor(
    public cartService: CartService,
    public baseService: BaseService
  ) {}

  ngOnInit(): void {
    if (!this.products?.length) {
      this.isLoading = true;

      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    }
  }

  // Increament
  async increment(product: Products) {
    this.quantity = this.cartService.getProductQuantity(product);

    if (product.quantity > this.quantity) {
      this.quantity++;
      await this.cartService.changeProductQuantity(product, true);
    }
  }

  // Decrement
  async decrement(product: Products) {
    this.quantity = this.cartService.getProductQuantity(product);

    if (this.quantity > 1) {
      this.quantity--;
      await this.cartService.changeProductQuantity(product, false);
    }
  }

  async removeItem(product: Products): Promise<void> {
    product.isLoading = true; // Set loading state for the specific product to true

    try {
      const isRemoved = await this.cartService.removeCartItem(product);

      if (isRemoved) {
        // Item was successfully removed from the cart
        setTimeout(() => {
          product.isLoading = false; // Set loading state for the specific product to false after a delay
        }, 1000);
      } else {
        // Item was not found in the cart
        console.error("Item not found in the cart.");
      }
    } catch (error) {
      // Handle any errors that occur during removal
      console.error("Error removing item:", error);
    }
  }

  getTotalAmount(): Observable<number> | undefined {
    return this.cartService.getTotalAmount();
  }

  calFinalTotalAmount(): Observable<number> | undefined {
    return this.cartService.getTotalAmount(
      this.totalDiscount,
      this.selectedShippingModel?.cost
    );
  }

  calculateStocksCount(product: Products): Observable<number> {
    return this.cartService.productQuantity(product);
  }
}
