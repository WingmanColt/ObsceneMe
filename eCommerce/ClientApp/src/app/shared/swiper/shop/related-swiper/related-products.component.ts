import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { environment } from "environments/environment";
import { Subject, takeUntil } from "rxjs";
import { ProductsService } from "src/app/Services/Product/products.service";
import { SimpleSliderComponent2 } from "src/app/shared/slider/simple-slider.component";

@Component({
  selector: "app-related-products",
  templateUrl: "./related-products.component.html",
  styleUrls: ["./related-products.component.scss"]
})
export class RelatedProductsComponent implements OnInit, OnDestroy {
  env = environment;
  settings = environment.pagesSettings.DetailsSettings;

  private destroy$ = new Subject<void>();
  isDataLoaded = false; // Added property to track data loading

  @ViewChild('relatedProductsSlider') sliderRef!: SimpleSliderComponent2;

  sliderConfig: any = {
    title: 'YOU MAY ALSO LIKE',
    slideChangeDelay: 50,
    draggable: true,
    delay: 5000,
    breakpoints: {
      mobile: { navEnabled: false, paginationEnabled: true, slideWidth: 50, slidesPerView: 2, slidesToSlide: 2 },
      tablet: { navEnabled: true, paginationEnabled: true, slideWidth: 30, slidesPerView: 3, slidesToSlide: 3 },
      desktop: { navEnabled: true, paginationEnabled: true, paginationPosition: 'thumbs-bottom', autoplay: true, slideWidth: 20, slidesPerView: 5, slidesToSlide: 5 }
    }
  };

  constructor(public productsService: ProductsService) {}

  ngOnInit(): void {
    this.productsService.getRelatedProducts(12)
      .pipe(takeUntil(this.destroy$))
      .subscribe(entities => {
        if (entities?.length) {
          this.sliderConfig.slides = entities;
          this.isDataLoaded = true; // Set to true once data is loaded
          this.sliderRef?.sliderInit();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
