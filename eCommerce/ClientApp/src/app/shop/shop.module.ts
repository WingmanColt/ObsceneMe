import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { SharedModule } from "../shared/shared.module";
import { ShopRoutingModule } from "./shop-routing.module";

// Product Details Components
import { ProductLeftSidebarComponent } from "./product/sidebar/product-left-sidebar/product-left-sidebar.component";

// Product Details Widgest Components
import { ServicesComponent } from "./product/widgets/services/services.component";
import { CountdownComponent } from "./product/widgets/countdown/countdown.component";
import { StockInventoryComponent } from "./product/widgets/stock-inventory/stock-inventory.component";

// Collection Widgets
import { PaginationComponent } from "./collection/widgets/pagination/pagination.component";
import { PriceComponent } from "./collection/widgets/price/price.component";

import { CheckoutComponent } from "./checkout/checkout.component";
import { isPayedSuccessComponent } from "./checkout/isPayedSuccess/isPayedSuccess.component";
import { StripeSuccessComponent } from "./checkout/StripeSuccess/StripeSuccess.component";

import { RouterModule } from "@angular/router";
import { CancelComponent } from "./checkout/cancel/cancel.component";
import { ReviewCommentsComponent } from "./product/widgets/review-comments/review-comments.component";

import { PipesModule } from "../shared/pipes/pipes.module";
import { codSuccessComponent } from "./checkout/codSuccess/codSuccess.component";
import { InvoiceComponent } from "./checkout/invoice/invoice.component";
import { AboutSectionComponent } from "./product/widgets/about-section/about-section/about-section.component";
import { ResultsComponent } from "./collection/widgets/results/results.component";
import { BrandsComponent } from "./collection/widgets/brands/brands.component";

import { FilterVariantsComponent } from "./collection/widgets/variants/variants.component";
import { CategoriesFilterComponent } from "./collection/widgets/categories-filter/categories-filter.component";
import { StickyActionsComponent } from "./product/widgets/sticky-actions/sticky-actions.component";
import { CalculateShippingPriceComponent } from "./checkout/calculatePrice/calculate-shipping-price/calculate-shipping-price.component";
import { ReviewsTemplateComponent } from "./product/widgets/about-section/about-section/reviews-template/reviews-template.component";
import { StyleTwoComponent } from "./checkout/templates/style-two/style-two/style-two.component";
import { CollectionPaginationComponent } from "./collection/collection-pagination/collection-pagination.component";
import { PaginationTwoComponent } from "./collection/widgets/paginationTwo/paginationTwo.component";
import { OccasionsComponent } from "./collection/widgets/occasions/occasions.component";
import { SortByComponent } from "./collection/widgets/sort-by/sort-by.component";
import { CartColumnComponent } from "./checkout/templates/style-two/style-two/cart-column/cart-column.component";
import { FloatingFilterComponent } from "./collection/widgets/floating-filter/floating-filter.component";
import { TrademarksComponent } from "./collection/widgets/trademarks/trademarks.component";
import { StorytellerComponent } from "./product/widgets/about-section/about-section/storyteller/storyteller.component";

@NgModule({
  declarations: [
    ProductLeftSidebarComponent,
    ServicesComponent,
    CountdownComponent,
    StockInventoryComponent,
    ReviewCommentsComponent,
    CollectionPaginationComponent,
    PaginationComponent,
    PaginationTwoComponent,
    PriceComponent,
    CheckoutComponent,
    isPayedSuccessComponent,
    StripeSuccessComponent,
    codSuccessComponent,
    InvoiceComponent,
    CancelComponent,
    AboutSectionComponent,
    ResultsComponent,
    FilterVariantsComponent,
    CategoriesFilterComponent,
    StickyActionsComponent,
    CalculateShippingPriceComponent,
    ReviewsTemplateComponent,
    StyleTwoComponent,
    BrandsComponent,
    OccasionsComponent,
    SortByComponent,
    CartColumnComponent,
    FloatingFilterComponent,
    TrademarksComponent,
    StorytellerComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    SharedModule,
    InfiniteScrollModule,
    ShopRoutingModule,
    RouterModule,
  ],
})
export class ShopModule {}
