import { NgModule } from "@angular/core";
import { Routes, RouterModule, RouteReuseStrategy } from "@angular/router";

import { ProductLeftSidebarComponent } from "./product/sidebar/product-left-sidebar/product-left-sidebar.component";
import { CartComponent } from "./cart/cart.component";
import { CheckoutComponent } from "./checkout/checkout.component";

import { CancelComponent } from "./checkout/cancel/cancel.component";
import { isPayedSuccessComponent } from "./checkout/isPayedSuccess/isPayedSuccess.component";
import { StripeSuccessComponent } from "./checkout/StripeSuccess/StripeSuccess.component";
import { codSuccessComponent } from "./checkout/codSuccess/codSuccess.component";
import { InvoiceComponent } from "./checkout/invoice/invoice.component";
import { PaymentCompleteGuard } from "../Guards/payment-completion.guard";
import { CollectionPaginationComponent } from "./collection/collection-pagination/collection-pagination.component";

const routes: Routes = [
  {
    path: 'product/:value',
    component: ProductLeftSidebarComponent,
  },
  {
    path: "collection",
    component: CollectionPaginationComponent, // Apply reuse strategy for this route
  },
  {
    path: "",
    component: CollectionPaginationComponent,
  },
  {
    path: "shop",
    component: CollectionPaginationComponent,
  },
  {
    path: "cart",
    component: CartComponent,
  },
  {
    path: "checkout",
    component: CheckoutComponent,
  },
  {
    path: "checkout/paymentSuccess",
    component: isPayedSuccessComponent,
  },
  {
    path: "checkout/stripeSuccess",
    component: StripeSuccessComponent,
    canActivate: [PaymentCompleteGuard],
  },
  {
    path: "checkout/404",
    component: CancelComponent,
  },
  {
    path: "checkout/cod",
    component: codSuccessComponent,
  },
  {
    path: "checkout/invoice",
    component: InvoiceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopRoutingModule {}
