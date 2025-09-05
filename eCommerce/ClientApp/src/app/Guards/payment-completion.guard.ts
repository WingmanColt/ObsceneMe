// payment-complete.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CheckoutService } from '../Services/Checkout/checkout.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentCompleteGuard implements CanActivate {
  constructor(private checkoutService: CheckoutService) {}

  canActivate() {
    if (this.checkoutService.isCheckoutFinished()) {
      return true; // Allow access to the route
    } else {
      // Redirect or show an error message to prevent access
      // For example, navigate to the cart or another appropriate page
      return false;
    }
  }
}