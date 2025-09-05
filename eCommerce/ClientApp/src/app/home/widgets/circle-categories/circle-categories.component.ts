import { Component, OnInit,  OnDestroy, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { Subject, takeUntil } from "rxjs";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { ProductFilterService } from "src/app/Services/Product/filters.service";
import { ProductsService } from "src/app/Services/Product/products.service";
import { Category, SubCategory } from "src/app/shared/classes/categories";
import { SimpleSliderComponent2 } from "src/app/shared/slider/simple-slider.component";

@Component({
  selector: "app-circle-categories",
  templateUrl: "./circle-categories.component.html",
  styleUrls: ["./circle-categories.component.scss"],
})
export class CircleCategoriesComponent implements OnInit, OnDestroy {
  env = environment;
  imageSrc = './assets/images/CategoryImages/';

  isMobile: boolean;
  isCategorySlides: boolean = false;

  currentCategory: Category = {};
  currentSubCategory: SubCategory = {};
  imageLoading: boolean = true; 

  private destroy$ = new Subject<void>(); 
  
  @ViewChild('circleCategoriesSlider') sliderRef!: SimpleSliderComponent2;
  sliderConfig: any = {
    slideChangeDelay: 50,
    draggable: true,
    changeToClickedSlide:true,
    delay: 5000, 
    breakpoints: {
      mobile: { slideWidth: 50, slidesPerView: 2, slidesToSlide: 2 },
      tablet: { slideWidth: 30, slidesPerView: 3, slidesToSlide: 3 },
      desktop: { autoplay:true, slideWidth: 25, slidesPerView: 5, slidesToSlide: 5 }
    }
  };


  constructor(
    private router: Router,
    private productsService: ProductsService, 
    private filterService: ProductFilterService,
    private deviceDetector: BreakpointDetectorService) {

    this.isMobile = this.deviceDetector.isDevice("Mobile");
  }

  ngOnInit(): void {
    this.productsService.categoriesWithSubs$
    .pipe(takeUntil(this.destroy$))
    .subscribe((entities: Category[]) => {
      if (entities.length === 1) {
        this.sliderConfig.slides = entities[0].subCategories;
        this.isCategorySlides = false;
      } 

      else if (entities.length > 1) {
        this.sliderConfig.slides = entities;
        this.isCategorySlides = true;
      }

     this.sliderRef?.sliderInit();
    });

   }

   handleOnClick($event: any): void {
    if(this.isCategorySlides) {
    this.currentCategory = this.currentCategory?.id === $event?.id ? null : $event;
    this.filterService.updateFilter('categoryId', this.currentCategory?.id)
    this.filterService.updateFilter('subCategoryId', null)
    } else {
    this.currentSubCategory = this.currentSubCategory?.id === $event?.id ? null : $event;
    this.filterService.updateFilter('subCategoryId', this.currentSubCategory?.id)
    }

    this.router.navigate(['/shop'], {
      queryParams: {
        categoryId: this.currentCategory?.id || null,
        subCategoryId: this.currentSubCategory?.id || null
      }
    });
  }

   ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onImageLoad() {
    this.imageLoading = false;
  }

  onImageError() {
    this.imageLoading = false;
  }

  getCategoryImageUrl(slide: any): string {
    const baseUrl = this.env.setting.categoryImageUrl;
    const extension = this.env.setting.categoryImageUrlExtension;
  
    if (this.isCategorySlides) {
      return `${baseUrl}${slide.icon}${extension}`;
    }

    return `${baseUrl}${slide.categoryShortName}/${slide.icon}${extension}`;
  }
  
}
