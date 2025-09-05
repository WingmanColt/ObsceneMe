import {
  Component,
  ViewEncapsulation,
  OnInit,
  ChangeDetectionStrategy,
} from "@angular/core";
import { environment } from "environments/environment";


@Component({
  selector: "app-ad-banner-swiper",
  templateUrl: "./ad-banner-swiper.component.html",
  styleUrls: ["./ad-banner-swiper.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdBannerSwiperComponent implements OnInit {
  settings = environment.swiperSettings.adBannerSwiperSettings;
  imageLoading: boolean = true;

  sliderConfig: any = {
    slideChangeDelay: 50,
    title:'',
    loop:0,
    draggable: true,
    delay: 5000, 
    breakpoints: {
      mobile: { navEnabled: false, paginationEnabled:true, slideWidth: 50, slidesPerView: 2, slidesToSlide: 2 },
      tablet: { navEnabled: true, paginationEnabled:true, slideWidth: 30, slidesPerView: 3, slidesToSlide: 3 },
      desktop: { navEnabled: true, paginationEnabled:true, paginationPosition:'thumbs-bottom', autoplay:true, slideWidth: 20, slidesPerView: 5, slidesToSlide: 5 }
    }
  };

  ngOnInit(): void {
    this.sliderConfig.slides = this.settings.SwiperArray;
  }

  onImageLoad(): void {
    this.imageLoading = false;
  }

  onImageError(): void {
    this.imageLoading = false;
  }
}


