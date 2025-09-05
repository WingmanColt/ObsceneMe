import { NgModule } from "@angular/core";
import {
  CommonModule,
  DatePipe,
  NgOptimizedImage
} from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BarRatingModule } from "ngx-bar-rating";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { TranslateModule } from "@ngx-translate/core";

// Header and Footer Components
import { HeaderOneComponent } from "./header/header-one/header-one.component";
import { FooterOneComponent } from "./footer/footer-one/footer-one.component";

// Components
import { BreadcrumbComponent } from "./components/breadcrumb/breadcrumb.component";

// Modals Components
import { QuickViewComponent } from "./components/modal/quick-view/quick-view.component";
import { VideoModalComponent } from "./components/modal/video-modal/video-modal.component";
import { SizeModalComponent } from "./components/modal/size-modal/size-modal.component";
import { AgeVerificationComponent } from "./components/modal/age-verification/age-verification.component";

// Skeleton Loader Components
import { SkeletonProductBoxComponent } from "./components/skeleton/skeleton-product-box/skeleton-product-box.component";

// Layout Box
import { LayoutBoxComponent } from "./components/layout-box/layout-box.component";

// Tap To Top
import { TapToTopComponent } from "./components/tap-to-top/tap-to-top.component";

// Pipes
import { AlertModalComponent } from "./components/modal/alert-modal/alert-modal.component";
import { ReviewModalComponent } from "./components/modal/review-modal/review-modal.component";
import { OrderModule } from "ngx-order-pipe";
import { CartMenuComponent } from "./components/cart-menu/cart-menu.component";
import { MenuBasicComponent } from "./components/menu-basic/menu-basic.component";

import { PipesModule } from "./pipes/pipes.module";
import { SettingsComponent } from "./components/settings/settings.component";
import { FastOrderComponent } from "./components/details/widgets/fast-order/fast-order.component";
import { SocialComponent } from "./components/details/widgets/social/social.component";
import { SearchBarComponent } from "./components/searchbar/searchbar.component";
import { ProductBoxVerticalComponent } from "./components/product/product-box-vertical/product-box-vertical.component";

import { DetailsComponent } from "./components/details/details.component";
import { RelatedProductsComponent } from "./swiper/shop/related-swiper/related-products.component";
import { ThumbPicturesSwiperComponent } from "./swiper/review-pictures-thumbs/thumbs-pictures.component";
import { SearchBarSimpleComponent } from "./components/searchbarSimple/searchSimple.component";
import { SelectVariantsComponent } from "./components/details/widgets/select-variants/select-variants.component";

import { BadgesComponent } from "./components/product/widgets/badges/badges.component";
import { TrandingSwiperComponent } from "./swiper/home/tranding-swiper/tranding-swiper.component";
import { ProductBaseComponent } from "./components/product/product-base/product-base.component";

import { LazyLoadDirective } from "../directives/lazyImageLoading";
import { ReviewFormComponent } from "../shop/product/widgets/review-form/review-form.component";
import { ProductBoxCardCleanComponent } from "./components/product/product-box-cardClean/product-box-cardClean.component";
import { ProgressBarComponent } from "./components/product/widgets/progress-bar/progress-bar.component";
import { FourComponent } from "./components/details/templates/Four/four.component";
import { CustomDropdownComponent } from "./components/custom-dropdown/custom-dropdown.component";
import { DiscountModalComponent } from "./components/modal/discount-modal/discount-modal.component";
import { AdBannerSwiperComponent } from "./swiper/home/ad-baner-swiper/ad-banner-swiper.component";

import { AuthModalComponent } from "./components/modal/auth-modal/auth-modal.component";
import { LoginComponent } from "./components/modal/auth-modal/pages/login/login.component";
import { RegisterComponent } from "./components/modal/auth-modal/pages/register/register.component";
import { ForgetPasswordComponent } from "./components/modal/auth-modal/pages/forget-password/forget-password.component";
import { VerificationSentComponent } from "./components/modal/auth-modal/pages/verification-sent/verification-sent.component";
import { VerifyCodeComponent } from "./components/modal/auth-modal/pages/forget-password/verify-code/verify-code.component";
import { ProductBoxRoundedComponent } from "./components/product/product-box-rounded/product-box-rounded.component";
import { FourSkeletonComponent } from "./components/details/templates/Four-skeleton/four-skeleton.component";
import { LazyLoaderComponent } from "./lazy-loader";
import { SliderCategoriesMobileComponent } from "./swiper/shop/slider-categories-mobile/slider-categories-mobile.component";
import { GalleryModalSwiperComponent } from "./swiper/gallery-modal/gallery-modal.component";
import { GalleryStyleThumbsMainComponent } from "./swiper/gallery-modal/templates/style1-thumbMain/style-thumbMain.component";
import { ProductsInfinityScrollComponent } from "./components/products-infinity-scroll/products-infinity-scroll.component";
import { HeaderTwoComponent } from "./header/header-two/header-two.component";
import { MegaMenuComponent } from "./components/mega-menu/mega-menu.component";
import { MobileMenuComponent } from "./components/mobile-menu/mobile-menu.component";
import { OnHoverVariantButtonComponent } from "./components/product/product-box-cardClean/on-hover-variant-button/on-hover-variant-button.component";
import { SwiperCategoriesPageComponent } from "./swiper/pages/swiper-categories-page/swiper-categories-page.component";
import { ReviewStarsComponent } from "./components/review-stars/review-stars.component";
import { MarketStatusComponent } from "./components/details/widgets/market-status/market-status.component";
import { CheckboxListComponent } from "./components/checkbox-list/checkbox-list.component";
import { SocialbarComponent } from "./socialbar/socialbar.component";
import { ReviewCardCleanComponent } from "./components/review-cards/review-card-clean/review-card-clean.component";
import { SimpleSliderComponent2 } from "./slider/simple-slider.component";
import { SliderGalleryProductComponent } from "./swiper/shop/slider-gallery-product/slider-gallery-product.component";
import { RedZoomModule } from "./redZoom/red-zoom.module";
import { ProductImageDirective } from "../directives/productImage.directive";
import { LazyOptimizedImageDirective } from "../directives/lazyOptimizedImage.directive";
import { FloatInputFieldComponent } from "./components/float-input-field/float-input-field.component";
import { LoadingComponent } from "./components/loading/loading.component";
import { SectionDividerComponent } from "./components/section-divider/section-divider.component";
import { QuantityBreaksComponent } from "../shop/product/widgets/quantity-breaks/quantity-breaks.component";
import { TooltipDirective } from "../directives/tooltip.directive";
import { NotFoundComponent } from "./components/404/404.component";
import { AuthResponseComponent } from "./components/modal/auth-modal/pages/response/response.component";

@NgModule({
  providers: [
    DatePipe /*, provideImageKitLoader("https://ik.imagekit.io/beautyflex/PREMIUMPUFFS/")*/,
  ],
  declarations: [
    SettingsComponent,
    HeaderOneComponent,
    HeaderTwoComponent,
    FooterOneComponent,
    MobileMenuComponent,
    MegaMenuComponent,
    MenuBasicComponent,
    BreadcrumbComponent,
    ProductBoxVerticalComponent,
    ProductBoxCardCleanComponent,
    OnHoverVariantButtonComponent,
    QuickViewComponent,
    CartMenuComponent,
    VideoModalComponent,
    SizeModalComponent,
    AlertModalComponent,
    ReviewModalComponent,
    AgeVerificationComponent,
    SkeletonProductBoxComponent,
    LayoutBoxComponent,
    TapToTopComponent,
    FastOrderComponent,
    DetailsComponent,
    SocialComponent,
    SearchBarComponent,
    SearchBarSimpleComponent,
    GalleryModalSwiperComponent,
    ThumbPicturesSwiperComponent,
    RelatedProductsComponent,
    SliderCategoriesMobileComponent,
    SelectVariantsComponent,
    BadgesComponent,
    TrandingSwiperComponent,
    ProductBaseComponent,
    FourSkeletonComponent,
    FourComponent,
    ReviewFormComponent,
    ProductBoxRoundedComponent,
    ProgressBarComponent,
    SliderGalleryProductComponent,
    CustomDropdownComponent,
    DiscountModalComponent,
    AdBannerSwiperComponent,
    AuthModalComponent,
    LoginComponent,
    RegisterComponent,
    ForgetPasswordComponent,
    VerificationSentComponent,
    VerifyCodeComponent,
    GalleryStyleThumbsMainComponent,
    ProductsInfinityScrollComponent,
    LazyOptimizedImageDirective,
    ProductImageDirective,
    LazyLoaderComponent,
    SwiperCategoriesPageComponent,
    ReviewStarsComponent,
    MarketStatusComponent,
    CheckboxListComponent,
    SocialbarComponent,
    ReviewCardCleanComponent,
    SimpleSliderComponent2,
    FloatInputFieldComponent,
    LoadingComponent,
    SectionDividerComponent,
    QuantityBreaksComponent,
    TooltipDirective,
    NotFoundComponent,
    AuthResponseComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BarRatingModule,
    LazyLoadImageModule,
    TooltipDirective,
    NgxSkeletonLoaderModule,
    TranslateModule, 
    SettingsComponent,
    HeaderOneComponent,
    HeaderTwoComponent,
    FooterOneComponent,
    BreadcrumbComponent,
    ProductBoxVerticalComponent,
    ProductBoxCardCleanComponent,
    OnHoverVariantButtonComponent,
    QuickViewComponent,
    CartMenuComponent,
    MegaMenuComponent,
    VideoModalComponent,
    SizeModalComponent,
    AlertModalComponent,
    ReviewModalComponent,
    AgeVerificationComponent,
    SkeletonProductBoxComponent,
    FourSkeletonComponent,
    LayoutBoxComponent,
    TapToTopComponent,
    OrderModule,
    FastOrderComponent,
    DetailsComponent,
    SearchBarComponent,
    SearchBarSimpleComponent,
    GalleryModalSwiperComponent,
    ThumbPicturesSwiperComponent,
    RelatedProductsComponent,
    SliderCategoriesMobileComponent,
    SelectVariantsComponent,
    TrandingSwiperComponent,
    ProductBaseComponent,
    ProductBoxRoundedComponent,
    ReviewFormComponent,
    ProgressBarComponent,
    FourComponent,
    SliderGalleryProductComponent,
    CustomDropdownComponent,
    DiscountModalComponent,
    AdBannerSwiperComponent,
    AuthModalComponent,
    VerifyCodeComponent,
    GalleryStyleThumbsMainComponent,
    ProductsInfinityScrollComponent,
    LazyOptimizedImageDirective,
    ProductImageDirective,
    LazyLoaderComponent,
    SwiperCategoriesPageComponent,
    ReviewStarsComponent,
    MarketStatusComponent,
    CheckboxListComponent,
    SocialbarComponent,
    ReviewCardCleanComponent,
    SimpleSliderComponent2,
    FloatInputFieldComponent,
    LoadingComponent,
    SectionDividerComponent,
    QuantityBreaksComponent,
    NotFoundComponent,
    AuthResponseComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BarRatingModule,
    LazyLoadDirective,
    RedZoomModule,
    LazyLoadImageModule, // [lazyLoad]
    NgOptimizedImage,
    TranslateModule.forChild(),
    NgxSkeletonLoaderModule.forRoot({
        theme: {
            extendsFromRoot: true,
        },
    })
],
})
export class SharedModule {}
