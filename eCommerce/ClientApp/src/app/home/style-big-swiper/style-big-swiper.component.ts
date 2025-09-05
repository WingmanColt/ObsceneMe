import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { ProductsService } from "src/app/Services/Product/products.service";
import { VideoModalComponent } from "src/app/shared/components/modal/video-modal/video-modal.component";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { TrandingSwiperComponent } from "src/app/shared/swiper/home/tranding-swiper/tranding-swiper.component";
import { AdBannerSwiperComponent } from "src/app/shared/swiper/home/ad-baner-swiper/ad-banner-swiper.component";
import { ProductsInfinityScrollComponent } from "src/app/shared/components/products-infinity-scroll/products-infinity-scroll.component";

@Component({
  selector: "app-home-style-big-swiper",
  templateUrl: "./style-big-swiper.component.html",
  styleUrls: ["./style-big-swiper.component.scss"],
})
export class StyleBigSwiperHomeComponent implements OnInit, AfterViewInit {
  settings = environment.homeSettings;
  isMobile: boolean;

  days: number;
  hours: number;
  minutes: number;
  seconds: number;

  date: Date;
  now: any;
  targetDate: any;
  targetTime: any;
  difference: number;

  categories$: Observable<any>;

  productCollections: any[] = ["New arrivals", "Trending", "Best sellers"];
  productsCount: Array<number> = environment.ngxLoaderArray;

  TrendingComponentVisible: boolean = false;
  TrendingSwiperComponent: any = TrandingSwiperComponent;

  TrendingSecondComponentVisible: boolean = false;
  TrendingSecondSwiperComponent: any = TrandingSwiperComponent;

  AdComponentVisible: boolean = false;
  AdSwiperComponent: any = AdBannerSwiperComponent;

  TopProductsComponentVisible: boolean = false;
  TopProductsComponent: any = ProductsInfinityScrollComponent;

  @ViewChild("videoModal") VideoModal: VideoModalComponent;

  constructor(
    public productsService: ProductsService,
    public deviceDetector: BreakpointDetectorService
  ) {
    this.isMobile = this.deviceDetector.isDevice("Mobile");
  }

  ngOnInit(): void {
    if(this.settings.showCategories)
    this.categories$ = this.productsService.categories$;

    if (this.settings.showTimer) {
      this.targetDate = new Date();
      this.targetDate.setDate(this.targetDate.getDate() + 1);
      this.targetTime = this.targetDate.getTime();
    }
  }

  ngAfterViewInit() {
    if (this.settings.showTimer) {
      setInterval(() => {
        this.tickTock();
        this.difference = this.targetTime - this.now;
        this.difference = this.difference / (1000 * 60 * 60 * 24);

        !isNaN(this.days)
          ? (this.days = Math.floor(this.difference))
          : (this.days = 0);
      }, 1000);
    }
  }

  tickTock() {
    this.date = new Date();
    this.now = this.date.getTime();
    this.days = Math.floor(this.difference);
    this.hours = 23 - this.date.getHours();
    this.minutes = 60 - this.date.getMinutes();
    this.seconds = 60 - this.date.getSeconds();
  }
}
