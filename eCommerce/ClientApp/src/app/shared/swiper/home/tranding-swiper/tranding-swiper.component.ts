import {
  Component,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnInit,
} from "@angular/core";
import { environment } from "environments/environment";
import { Subject, takeUntil } from "rxjs";
import { ProductsService } from "src/app/Services/Product/products.service";

@Component({
  selector: "app-tranding-swiper",
  templateUrl: "./tranding-swiper.component.html",
  styleUrls: ["./tranding-swiper.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrandingSwiperComponent implements OnInit, OnDestroy {
  env = environment;
  settings = environment.homeSettings;

  private destroy$ = new Subject<void>(); 

  sliderConfig: any = {
    title:'Just Dropped',
    slideChangeDelay: 50,
    draggable: true,
    delay: 5000, 
    breakpoints: {
      mobile: { navEnabled: false, paginationEnabled:true, slideWidth: 50, slidesPerView: 2, slidesToSlide: 2 },
      tablet: { navEnabled: true, paginationEnabled:true, slideWidth: 30, slidesPerView: 3, slidesToSlide: 3 },
      desktop: { navEnabled: true, paginationEnabled:true, paginationPosition:'thumbs-bottom', autoplay:true, slideWidth: 20, slidesPerView: 5, slidesToSlide: 5 }
    }
  };

  constructor(private productsService: ProductsService) {
  }

  ngOnInit(): void {
    this.productsService.getRelatedProducts(12)
    .pipe(takeUntil(this.destroy$))
    .subscribe(entities => {
     this.sliderConfig.slides = entities;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
