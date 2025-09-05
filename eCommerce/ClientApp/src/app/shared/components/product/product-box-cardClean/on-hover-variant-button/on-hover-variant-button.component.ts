import { Component, Input } from '@angular/core';
import { CartService } from 'src/app/Services/Cart/cart.service';
import { MarketStatus, Products, PurchaseStatus, SpecialProduct } from 'src/app/shared/classes/product';
import { BaseService } from 'src/app/Services/base.service';

@Component({
  selector: 'app-on-hover-variant-button',
  templateUrl: './on-hover-variant-button.component.html',
  styleUrl: './on-hover-variant-button.component.scss'
})
export class OnHoverVariantButtonComponent {

@Input() product: Products | SpecialProduct; 
selectedVariants: any[];

isCartOpen: boolean = false;
purchaseStatus = PurchaseStatus;
marketStatus = MarketStatus;
isLoadingActive: boolean = false;
counter: number = 1;

constructor(public cartService: CartService, 
  private baseService: BaseService) {
 }


  async AddToCart() {
    if (!this.product && this.isLoadingActive) return;
  
    this.isLoadingActive = true;
  
    try {
      const result = await this.cartService.addToCartAsync(this.product, this.counter, this.selectedVariants);
      if(result){
        this.baseService.updateMenuState({ isCartMenuOpen: true });

      setTimeout(() => {
        this.isLoadingActive = false;
      }, 500);
    }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

}
