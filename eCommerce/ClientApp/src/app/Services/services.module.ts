// services.module.ts
import { NgModule } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AccountService } from './Account/account.service';
import { DatabaseService } from './Admin/database.service';
import { CartService } from './Cart/cart.service';
import { CheckoutService } from './Checkout/checkout.service';
import { BreakpointDetectorService } from './Devices/breakpoint-detector.service';
import { LocalStorageService } from './LocalStorage/local-storage.service';
import { OrderService } from './Order/order.service';
import { CodService } from './Payments/cod.service';
import { PaypalService } from './Payments/paypal.service';
import { StripeService } from './Payments/stripe.service';
import { ProductsService } from './Product/products.service';
import { ReviewsService } from './Review/reviews.service';
import { SearchService } from './Search/search.service';
import { ShippingService } from './Shipping/shipping.service';
import { SiblingEventService } from './Siblings/sibling-event.service';
import { SubscriptionTrackerService } from './Tracker/subscription-tracker.service';
import { VerificationService } from './Verification/verification.service';
import { BaseService } from './base.service';
import { TimerService } from './timer.service';
import { DiscountModalService } from './Modal/modal.service';
import { ProductFilterService } from './Product/filters.service';

@NgModule({
    providers: [
        BaseService,
        TimerService,
        CookieService,
        AccountService,
        DatabaseService,
        CartService,
        CheckoutService,
        BreakpointDetectorService,
        LocalStorageService,
        DiscountModalService,
        OrderService,
        CodService,
        PaypalService,
        StripeService,
        ProductsService,
        ProductFilterService,
        ReviewsService,
        SearchService,
        ShippingService,
        SiblingEventService,
        SubscriptionTrackerService,
        VerificationService
    ],
})
export class ServicesModule { }