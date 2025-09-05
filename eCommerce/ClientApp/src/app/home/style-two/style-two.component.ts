import { Component, ViewChild } from "@angular/core";
import { environment } from "environments/environment";
import { ProductsService } from "src/app/Services/Product/products.service";
import { VideoModalComponent } from "src/app/shared/components/modal/video-modal/video-modal.component";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { AdBannerSwiperComponent } from "src/app/shared/swiper/home/ad-baner-swiper/ad-banner-swiper.component";
import { ProductsInfinityScrollComponent } from "src/app/shared/components/products-infinity-scroll/products-infinity-scroll.component";
import { CircleCategoriesComponent } from "../widgets/circle-categories/circle-categories.component";
import { ProductSliderTrendingComponent } from "../widgets/product-slider-trending/product-slider-trending.component";
import { ProductReviewCarouselComponent } from "../widgets/product-review-carousel/product-review-carousel.component";

@Component({
  selector: "app-home-style-two",
  templateUrl: "./style-two.component.html",
  styleUrls: ["./style-two.component.scss"],
})
export class StyleTwoHomeComponent  {
  settings = environment.homeSettings;
  isMobile: boolean;

  // Visibility and components
  CircleCategoriesComponentVisible = false;
  CircleCategoriesComponent: any = CircleCategoriesComponent;

  TrendingComponentVisible = false;
  TrendingSwiperComponent: any = ProductSliderTrendingComponent;

  TrendingSecondComponentVisible = false;
  TrendingSecondSwiperComponent: any = ProductSliderTrendingComponent;

  AdComponentVisible = false;
  AdSwiperComponent: any = AdBannerSwiperComponent;

  ProductsInfinityScrollComponentVisible = false;
  ProductsInfinityScrollComponent: any = ProductsInfinityScrollComponent;

  ProductReviewCarouselComponentVisible = false;
  ProductReviewCarouselComponent: any = ProductReviewCarouselComponent;


  @ViewChild("videoModal") VideoModal: VideoModalComponent;
  constructor(public productsService: ProductsService, public deviceDetector: BreakpointDetectorService) {

    this.isMobile = this.deviceDetector.isDevice("Mobile");
  }

}
