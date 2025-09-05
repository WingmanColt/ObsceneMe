import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { HomeRoutingModule } from "./home-routing.module";

// Widgest Components
import { StyleBigSwiperHomeComponent } from "./style-big-swiper/style-big-swiper.component";

import { LazyLoadImageModule } from "ng-lazyload-image";
import { StyleTwoHomeComponent } from "./style-two/style-two.component";
import { CircleCategoriesComponent } from "./widgets/circle-categories/circle-categories.component";
import { ProductReviewCarouselComponent } from "./widgets/product-review-carousel/product-review-carousel.component";
import { ProductSliderTrendingComponent } from "./widgets/product-slider-trending/product-slider-trending.component";
import { MainSliderComponent } from "./widgets/main-slider/main-slider.component";
import { SingleProductStyleComponent } from "./single-product-style/single-product-style.component";
import { ProductShowComponent } from "./widgets/product-show/product-show.component";
import { GuaranteesComponent } from "./widgets/guarantees/guarantees.component";
import { AdBannerComponent } from "./widgets/ad-banner/ad-banner.component";

@NgModule({
    declarations: [
        CircleCategoriesComponent, 
        StyleBigSwiperHomeComponent, 
        StyleTwoHomeComponent, 
        SingleProductStyleComponent,
        MainSliderComponent,
        ProductReviewCarouselComponent,
        ProductSliderTrendingComponent,
        ProductShowComponent,
        GuaranteesComponent,
        AdBannerComponent,
     //   SafeUrlPipe
        ],
    imports: [CommonModule, HomeRoutingModule, LazyLoadImageModule, SharedModule],
  //  exports: [SafeUrlPipe]
})
export class HomeModule { }
