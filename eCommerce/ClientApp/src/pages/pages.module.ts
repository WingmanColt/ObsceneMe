import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
// import { GalleryModule } from '@ks89/angular-modal-gallery';
import { SharedModule } from '../shared/shared.module';
import { PagesRoutingModule } from './pages-routing.module';

// Pages Components
//import { WishlistComponent } from './account/wishlist/wishlist.component';
import { CartComponent } from './account/cart/cart.component';
import { ContactComponent } from './account/contact/contact.component';
import { CheckoutComponent } from './account/checkout/checkout.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { CompareTwoComponent } from './compare/compare-two/compare-two.component';
import { CollectionComponent } from './collection/collection.component';
import { ErrorComponent } from './error/error.component';
import { FaqComponent } from './faq/faq.component';
import { ReturnsWarrantyComponent } from './returns-warranty/returns-warranty.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  declarations: [
    // WishlistComponent,
    CartComponent,
    ContactComponent,
    CheckoutComponent,
    AboutUsComponent,
    CompareTwoComponent,
    CollectionComponent,
    ErrorComponent,
    FaqComponent,
    ReturnsWarrantyComponent,
    PrivacyComponent
  ],
  imports: [
    CommonModule,
    CarouselModule,
    NgOptimizedImage,
    SwiperModule,
    SharedModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }
