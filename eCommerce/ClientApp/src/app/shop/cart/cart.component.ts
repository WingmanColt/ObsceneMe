import { Component } from "@angular/core";
import { Products } from "../../shared/classes/product";
import { CartService } from "../../Services/Cart/cart.service";
import { Observable } from "rxjs";
import { BaseService } from "src/app/Services/base.service";

import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"],
})
export class CartComponent {
  currBreadCrumb: BreadcrumbObject[] = [{ title: "Cart", url: "/shop/cart" }];
  products$: Observable<any>;
  purchasedQuantity: { [productId: number]: number } = {};

  constructor(public cartService: CartService, public baseService: BaseService) {
    this.products$ = this.cartService.cartProducts$;
  }

  // Increament
  async increment(product: Products) {
    console.log('increment')
    const quantity = this.cartService.getProductQuantity(product);

    if (product.quantity > quantity) {
      this.updateQuantity(product.id, quantity + 1);
      await this.cartService.changeProductQuantity(product, true);
    }
  }

  // Decrement
  async decrement(product: Products) {
    const quantity = this.cartService.getProductQuantity(product);

    if (quantity > 1) {
      this.updateQuantity(product.id, quantity - 1);
      await this.cartService.changeProductQuantity(product, false);
    }
  }

  updateQuantity(productId: number, newQuantity: number) {
    this.purchasedQuantity[productId] = newQuantity;
  }
  calculateStocksCount(product: Products): Observable<number> {
    return this.cartService.productQuantity(product);
  }
  productTotalPrice(): Observable<number> {
    return this.cartService.getTotalAmount();
  }
  productTotalDiscount(products: Products[]) {
    // return this.cartService.getTotalDiscount(products);
  }

  async removeItem(product: Products) {
    await this.cartService.removeCartItem(product);
  }

  updateCurrency(val: any) {
    return (val * this.baseService.activeCurrency.price).toFixed(2);
  }
}
